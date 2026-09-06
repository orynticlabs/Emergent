/**
 * WhatsApp module types. Step 1 added configuration storage; Step 2 adds
 * the appId field and the settings API/UI. Still no conversations, inbox,
 * sending, or webhook processing — see whatsapp.repo.ts and
 * whatsapp.service.ts for what these types back.
 */

// ── Provider ───────────────────────────────────────────────────────────────────

/**
 * Every provider OryCMS's WhatsApp settings schema is shaped to support.
 * Only "meta" (WhatsApp Cloud API) is wired up in a later step — the rest
 * are reserved so the column/type doesn't need a breaking change later.
 */
export const ORYCMS_WHATSAPP_PROVIDERS = [
  "meta",
  "twilio",
  "360dialog",
  "gupshup",
  "interakt",
] as const;

export type OryCMSWhatsAppProvider = (typeof ORYCMS_WHATSAPP_PROVIDERS)[number];

export function isOryCMSWhatsAppProvider(value: unknown): value is OryCMSWhatsAppProvider {
  return (
    typeof value === "string" &&
    (ORYCMS_WHATSAPP_PROVIDERS as readonly string[]).includes(value)
  );
}

// ── Persisted record ──────────────────────────────────────────────────────────

/**
 * Row shape as stored in orycms_whatsapp_settings. "accessToken", "appSecret",
 * and "verifyToken" all hold AES-256-GCM ciphertext blobs (see
 * whatsapp.crypto.ts), never plaintext — callers that read through
 * whatsapp.repo.ts directly get these raw, still-encrypted; whatsapp.service.ts
 * is what decrypts them, and only when explicitly asked to.
 */
export interface OryCMSWhatsAppSettingsRecord {
  id: string;
  provider: OryCMSWhatsAppProvider;
  enabled: boolean;
  displayName: string | null;
  accessToken: string | null;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  appId: string | null;
  verifyToken: string | null;
  appSecret: string | null;
  webhookEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response-safe projection: never carries accessToken, appSecret, or
 * verifyToken — encrypted or not — only whether each has been configured.
 * This is the only shape the settings API route may return;
 * OryCMSWhatsAppSettingsRecord must never cross into a client response as-is.
 */
export type OryCMSWhatsAppSettingsSafe = Omit<
  OryCMSWhatsAppSettingsRecord,
  "accessToken" | "appSecret" | "verifyToken"
> & {
  accessTokenConfigured: boolean;
  appSecretConfigured: boolean;
  verifyTokenConfigured: boolean;
  /** True once the required fields for the selected provider are present (currently: accessToken, phoneNumberId, businessAccountId). Not a live health check — see OryCMSWhatsAppTestConnectionResult for that. */
  connected: boolean;
};

// ── Write inputs ───────────────────────────────────────────────────────────────

/** Input to the service layer — accessToken/appSecret/verifyToken (if present) are plaintext; the service encrypts them before they ever reach the repository. */
export interface OryCMSSaveWhatsAppSettingsInput {
  provider: OryCMSWhatsAppProvider;
  enabled?: boolean;
  displayName?: string | null;
  accessToken?: string | null;
  phoneNumberId?: string | null;
  businessAccountId?: string | null;
  appId?: string | null;
  verifyToken?: string | null;
  appSecret?: string | null;
  webhookEnabled?: boolean;
}

export type OryCMSUpdateWhatsAppSettingsInput = Partial<OryCMSSaveWhatsAppSettingsInput>;

/**
 * Input to the repository layer — same shape, but accessToken/appSecret/
 * verifyToken (if present) are already encrypted blobs. The repository
 * never sees plaintext and never performs encryption itself.
 */
export interface OryCMSWhatsAppSettingsWriteRecord {
  provider: OryCMSWhatsAppProvider;
  enabled: boolean;
  displayName: string | null;
  accessToken: string | null;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  appId: string | null;
  verifyToken: string | null;
  appSecret: string | null;
  webhookEnabled: boolean;
}

export type OryCMSWhatsAppSettingsPatch = Partial<OryCMSWhatsAppSettingsWriteRecord>;

// ── Connection test ────────────────────────────────────────────────────────────

export interface OryCMSWhatsAppTestConnectionResult {
  ok: boolean;
  code: string;
  message: string;
}
