import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSWhatsAppSchema } from "./whatsapp.schema";
import type {
  OryCMSWhatsAppSettingsPatch,
  OryCMSWhatsAppSettingsRecord,
  OryCMSWhatsAppSettingsWriteRecord,
  OryCMSWhatsAppTestConnectionResult,
} from "./whatsapp.types";

/**
 * Repository for orycms_whatsapp_settings - plain persistence only. No
 * encryption/decryption happens here (whatsapp.service.ts owns that, the
 * same split auth/mfa.ts uses around auth/mfa.crypto.ts) and no permission
 * checks happen here (routes gate access via requireOryCMSPermission /
 * guardOryCMS, same as every other OryCMS repository).
 *
 * The table is a singleton: OryCMS connects to exactly one WhatsApp
 * account at a time in this step, so every method operates on "the"
 * settings row rather than taking an id - mirroring settings.repo.ts's
 * getOryCMSSetting/setOryCMSSetting shape for a single-row concern.
 */

const COLUMNS = `id, provider, enabled, "displayName", "accessToken", "phoneNumberId",
                 "businessAccountId", "appId", "verifyToken", "appSecret", "webhookEnabled",
                 "createdAt", "updatedAt"`;

function notConfiguredError(): Error {
  return Object.assign(
    new Error("WhatsApp settings have not been configured yet."),
    { code: "WHATSAPP_SETTINGS_NOT_FOUND", statusCode: 404 },
  );
}

// ── Read ───────────────────────────────────────────────────────────────────────

export async function getOryCMSWhatsAppSettings(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppSettingsRecord | null> {
  await ensureOryCMSWhatsAppSchema(pool);

  const result = await pool.query<OryCMSWhatsAppSettingsRecord>(
    `SELECT ${COLUMNS} FROM orycms_whatsapp_settings ORDER BY "createdAt" ASC LIMIT 1`,
  );
  return result.rows[0] ?? null;
}

// ── Write ──────────────────────────────────────────────────────────────────────

/**
 * Creates the WhatsApp settings row if none exists, or replaces every
 * field on the existing one (full-record upsert - matching the "save"
 * naming distinct from the partial "update" below).
 */
export async function saveOryCMSWhatsAppSettings(
  input: OryCMSWhatsAppSettingsWriteRecord,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppSettingsRecord> {
  await ensureOryCMSWhatsAppSchema(pool);

  const existing = await getOryCMSWhatsAppSettings(pool);

  if (existing) {
    const result = await pool.query<OryCMSWhatsAppSettingsRecord>(
      `UPDATE orycms_whatsapp_settings SET
         provider = $1, enabled = $2, "displayName" = $3, "accessToken" = $4,
         "phoneNumberId" = $5, "businessAccountId" = $6, "appId" = $7,
         "verifyToken" = $8, "appSecret" = $9, "webhookEnabled" = $10, "updatedAt" = NOW()
       WHERE id = $11
       RETURNING ${COLUMNS}`,
      [
        input.provider,
        input.enabled,
        input.displayName,
        input.accessToken,
        input.phoneNumberId,
        input.businessAccountId,
        input.appId,
        input.verifyToken,
        input.appSecret,
        input.webhookEnabled,
        existing.id,
      ],
    );
    return result.rows[0];
  }

  const result = await pool.query<OryCMSWhatsAppSettingsRecord>(
    `INSERT INTO orycms_whatsapp_settings
       (id, provider, enabled, "displayName", "accessToken", "phoneNumberId",
        "businessAccountId", "appId", "verifyToken", "appSecret", "webhookEnabled",
        "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
     RETURNING ${COLUMNS}`,
    [
      input.provider,
      input.enabled,
      input.displayName,
      input.accessToken,
      input.phoneNumberId,
      input.businessAccountId,
      input.appId,
      input.verifyToken,
      input.appSecret,
      input.webhookEnabled,
    ],
  );
  return result.rows[0];
}

/**
 * Partial update of the existing settings row. Throws
 * WHATSAPP_SETTINGS_NOT_FOUND if nothing has been saved yet - callers that
 * want create-or-update semantics should use saveOryCMSWhatsAppSettings.
 */
export async function updateOryCMSWhatsAppSettings(
  patch: OryCMSWhatsAppSettingsPatch,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppSettingsRecord> {
  await ensureOryCMSWhatsAppSchema(pool);

  const existing = await getOryCMSWhatsAppSettings(pool);
  if (!existing) throw notConfiguredError();

  const merged: OryCMSWhatsAppSettingsWriteRecord = {
    provider: patch.provider ?? existing.provider,
    enabled: patch.enabled ?? existing.enabled,
    displayName: patch.displayName !== undefined ? patch.displayName : existing.displayName,
    accessToken: patch.accessToken !== undefined ? patch.accessToken : existing.accessToken,
    phoneNumberId:
      patch.phoneNumberId !== undefined ? patch.phoneNumberId : existing.phoneNumberId,
    businessAccountId:
      patch.businessAccountId !== undefined
        ? patch.businessAccountId
        : existing.businessAccountId,
    appId: patch.appId !== undefined ? patch.appId : existing.appId,
    verifyToken: patch.verifyToken !== undefined ? patch.verifyToken : existing.verifyToken,
    appSecret: patch.appSecret !== undefined ? patch.appSecret : existing.appSecret,
    webhookEnabled: patch.webhookEnabled ?? existing.webhookEnabled,
  };

  const result = await pool.query<OryCMSWhatsAppSettingsRecord>(
    `UPDATE orycms_whatsapp_settings SET
       provider = $1, enabled = $2, "displayName" = $3, "accessToken" = $4,
       "phoneNumberId" = $5, "businessAccountId" = $6, "appId" = $7,
       "verifyToken" = $8, "appSecret" = $9, "webhookEnabled" = $10, "updatedAt" = NOW()
     WHERE id = $11
     RETURNING ${COLUMNS}`,
    [
      merged.provider,
      merged.enabled,
      merged.displayName,
      merged.accessToken,
      merged.phoneNumberId,
      merged.businessAccountId,
      merged.appId,
      merged.verifyToken,
      merged.appSecret,
      merged.webhookEnabled,
      existing.id,
    ],
  );
  return result.rows[0];
}

export async function deleteOryCMSWhatsAppSettings(pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureOryCMSWhatsAppSchema(pool);
  await pool.query(`DELETE FROM orycms_whatsapp_settings`);
}

// ── Connection test ────────────────────────────────────────────────────────────

/**
 * Placeholder only - no provider API is called. Verifies a settings row
 * exists and reports which required fields are still missing, but performs
 * no network request. A later step replaces this with a real Meta Cloud
 * API health check while keeping the same signature and result shape.
 */
export async function testOryCMSWhatsAppConnection(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppTestConnectionResult> {
  const settings = await getOryCMSWhatsAppSettings(pool);

  if (!settings) {
    return { ok: false, code: "NOT_CONFIGURED", message: "WhatsApp has not been configured yet." };
  }

  const missing: string[] = [];
  if (!settings.accessToken) missing.push("accessToken");
  if (!settings.phoneNumberId) missing.push("phoneNumberId");
  if (!settings.businessAccountId) missing.push("businessAccountId");

  if (missing.length > 0) {
    return {
      ok: false,
      code: "INCOMPLETE_CONFIGURATION",
      message: `Missing required field(s): ${missing.join(", ")}.`,
    };
  }

  return {
    ok: false,
    code: "NOT_IMPLEMENTED",
    message:
      "Configuration looks complete, but the live connection check is not implemented yet.",
  };
}
