import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import {
  deleteOryCMSWhatsAppSettings,
  getOryCMSWhatsAppSettings,
  saveOryCMSWhatsAppSettings,
  testOryCMSWhatsAppConnection,
  updateOryCMSWhatsAppSettings,
} from "./whatsapp.repo";
import { decryptOryCMSWhatsAppSecret, encryptOryCMSWhatsAppSecret } from "./whatsapp.crypto";
import { isOryCMSWhatsAppProvider } from "./whatsapp.types";
import { sendOryCMSWhatsAppTextMessage } from "./whatsapp.outbound";
import type {
  OryCMSSaveWhatsAppSettingsInput,
  OryCMSUpdateWhatsAppSettingsInput,
  OryCMSWhatsAppProvider,
  OryCMSWhatsAppSettingsRecord,
  OryCMSWhatsAppSettingsSafe,
  OryCMSWhatsAppTestConnectionResult,
} from "./whatsapp.types";
import type { OryCMSWhatsAppSendResult } from "./whatsapp.outbound.types";

/** Decrypted credentials the webhook route needs — for internal use only, never serialized into an HTTP response (see OryCMSWhatsAppService.getWebhookVerificationConfig's doc comment). */
export interface OryCMSWhatsAppWebhookVerificationConfig {
  provider: OryCMSWhatsAppProvider;
  phoneNumberId: string | null;
  verifyToken: string | null;
  appSecret: string | null;
}

/**
 * Service layer for the WhatsApp module — the only place that touches
 * plaintext secrets (accessToken, appSecret, verifyToken). Every method
 * here is what the settings route (app/api/orycms/whatsapp/settings/route.ts)
 * calls after its own requireOryCMSPermission / guardOryCMS check — the
 * same "permission checks live at the route, not the repository/service"
 * split payments and mfa already follow (see whatsapp.repo.ts's header
 * comment). No permission logic is duplicated or hardcoded here.
 */

function assertKnownProvider(provider: string): void {
  if (!isOryCMSWhatsAppProvider(provider)) {
    throw Object.assign(new Error(`Unknown WhatsApp provider "${provider}".`), {
      code: "WHATSAPP_INVALID_PROVIDER",
      statusCode: 422,
    });
  }
}

/**
 * Strips every secret (accessToken, appSecret, verifyToken) out of a full
 * record, replacing each with a boolean so callers can render "configured"
 * without ever seeing a value — and adds "connected", derived from whether
 * the fields a live connection needs are present. This is the only shape
 * that may leave the service layer for an API response.
 */
function toSafe(record: OryCMSWhatsAppSettingsRecord): OryCMSWhatsAppSettingsSafe {
  const { accessToken, appSecret, verifyToken, ...rest } = record;
  return {
    ...rest,
    accessTokenConfigured: Boolean(accessToken),
    appSecretConfigured: Boolean(appSecret),
    verifyTokenConfigured: Boolean(verifyToken),
    connected: Boolean(accessToken && rest.phoneNumberId && rest.businessAccountId),
  };
}

/** Encrypts a plaintext secret for storage, or passes through null/undefined ("leave unset" / "no change" — the caller has already decided which). */
function encryptIfPresent(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return encryptOryCMSWhatsAppSecret(value);
}

export const OryCMSWhatsAppService = {
  /** Response-safe settings — never includes accessToken, appSecret, or verifyToken, encrypted or not. */
  async getSettings(pool: Pool = getOryCMSPool()): Promise<OryCMSWhatsAppSettingsSafe | null> {
    const record = await getOryCMSWhatsAppSettings(pool);
    return record ? toSafe(record) : null;
  },

  /**
   * Decrypts and returns the live access token. Provided so the encryption
   * scheme is verifiably reversible and usable outside sendTextMessage()
   * below if a future caller ever needs the raw token for something other
   * than sending a text message. Never logs the result.
   */
  async getDecryptedAccessToken(pool: Pool = getOryCMSPool()): Promise<string | null> {
    const record = await getOryCMSWhatsAppSettings(pool);
    if (!record?.accessToken) return null;
    return decryptOryCMSWhatsAppSecret(record.accessToken);
  },

  /**
   * Decrypts and returns verifyToken/appSecret for the webhook route
   * (app/api/orycms/whatsapp/webhook/route.ts) — the ONLY caller this is
   * meant for. The webhook has no admin session to gate on (WhatsApp calls
   * it directly, unauthenticated by OryCMS's RBAC), so this is how it gets
   * the credentials it needs to verify Meta's requests without going
   * through the "manage"-gated settings route. NEVER serialize this
   * return value into an HTTP response — unlike getSettings()'s
   * OryCMSWhatsAppSettingsSafe, this intentionally is not response-safe.
   */
  async getWebhookVerificationConfig(
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppWebhookVerificationConfig | null> {
    const record = await getOryCMSWhatsAppSettings(pool);
    if (!record) return null;
    return {
      provider: record.provider,
      phoneNumberId: record.phoneNumberId,
      verifyToken: record.verifyToken ? decryptOryCMSWhatsAppSecret(record.verifyToken) : null,
      appSecret: record.appSecret ? decryptOryCMSWhatsAppSecret(record.appSecret) : null,
    };
  },

  /** Creates the settings row if none exists, or fully replaces it. Encrypts accessToken/appSecret/verifyToken before they ever reach the repository. */
  async saveSettings(
    input: OryCMSSaveWhatsAppSettingsInput,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppSettingsSafe> {
    assertKnownProvider(input.provider);

    const record = await saveOryCMSWhatsAppSettings(
      {
        provider: input.provider,
        enabled: input.enabled ?? false,
        displayName: input.displayName ?? null,
        accessToken: encryptIfPresent(input.accessToken) ?? null,
        phoneNumberId: input.phoneNumberId ?? null,
        businessAccountId: input.businessAccountId ?? null,
        appId: input.appId ?? null,
        verifyToken: encryptIfPresent(input.verifyToken) ?? null,
        appSecret: encryptIfPresent(input.appSecret) ?? null,
        webhookEnabled: input.webhookEnabled ?? false,
      },
      pool,
    );
    return toSafe(record);
  },

  /**
   * Partial update of the existing settings row. Encrypts a secret field
   * only when the caller actually supplied a new value for it — fields left
   * out of `patch` are untouched, so an already-stored secret is never
   * overwritten by omission. Callers (the PATCH route) are responsible for
   * not putting a blank/empty value into `patch` for a secret the admin
   * didn't intend to change.
   */
  async updateSettings(
    patch: OryCMSUpdateWhatsAppSettingsInput,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppSettingsSafe> {
    if (patch.provider !== undefined) assertKnownProvider(patch.provider);

    const record = await updateOryCMSWhatsAppSettings(
      {
        ...(patch.provider !== undefined && { provider: patch.provider }),
        ...(patch.enabled !== undefined && { enabled: patch.enabled }),
        ...(patch.displayName !== undefined && { displayName: patch.displayName }),
        ...(patch.accessToken !== undefined && {
          accessToken: encryptIfPresent(patch.accessToken) ?? null,
        }),
        ...(patch.phoneNumberId !== undefined && { phoneNumberId: patch.phoneNumberId }),
        ...(patch.businessAccountId !== undefined && {
          businessAccountId: patch.businessAccountId,
        }),
        ...(patch.appId !== undefined && { appId: patch.appId }),
        ...(patch.verifyToken !== undefined && {
          verifyToken: encryptIfPresent(patch.verifyToken) ?? null,
        }),
        ...(patch.appSecret !== undefined && {
          appSecret: encryptIfPresent(patch.appSecret) ?? null,
        }),
        ...(patch.webhookEnabled !== undefined && { webhookEnabled: patch.webhookEnabled }),
      },
      pool,
    );
    return toSafe(record);
  },

  async deleteSettings(pool: Pool = getOryCMSPool()): Promise<void> {
    await deleteOryCMSWhatsAppSettings(pool);
  },

  /** Placeholder — see whatsapp.repo.ts's testOryCMSWhatsAppConnection. No provider API is called in this step. */
  async testConnection(pool: Pool = getOryCMSPool()): Promise<OryCMSWhatsAppTestConnectionResult> {
    return testOryCMSWhatsAppConnection(pool);
  },

  /**
   * Sends a text message to `customerId` using the currently configured
   * provider — the caller never needs to know it's Meta (or, later,
   * Twilio/360dialog/Gupshup/Interakt); that dispatch happens inside
   * sendOryCMSWhatsAppTextMessage (whatsapp.outbound.ts). Never throws —
   * every failure (not configured, invalid request, upstream API error)
   * comes back as `{ success: false, error }`, matching
   * OryCMSGeminiService.generateContent()'s contract. Never logs the
   * access token or the message text.
   */
  async sendTextMessage(
    customerId: string,
    text: string,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppSendResult> {
    const fail = (
      code: string,
      message: string,
      provider: OryCMSWhatsAppProvider = "meta",
    ): OryCMSWhatsAppSendResult => ({ success: false, provider, messageId: null, error: { code, message } });

    if (!customerId || !customerId.trim()) {
      return fail("WHATSAPP_INVALID_REQUEST", "customerId is required.");
    }
    if (!text || !text.trim()) {
      return fail("WHATSAPP_INVALID_REQUEST", "text is required.");
    }

    const record = await getOryCMSWhatsAppSettings(pool);
    if (!record) {
      return fail("WHATSAPP_NOT_CONFIGURED", "WhatsApp has not been configured yet.");
    }
    if (!record.accessToken || !record.phoneNumberId) {
      return fail(
        "WHATSAPP_NOT_CONFIGURED",
        "WhatsApp is missing required configuration (access token and/or phone number id).",
        record.provider,
      );
    }

    const accessToken = decryptOryCMSWhatsAppSecret(record.accessToken);
    return sendOryCMSWhatsAppTextMessage(
      record.provider,
      { accessToken, phoneNumberId: record.phoneNumberId },
      { customerId, text },
    );
  },
};
