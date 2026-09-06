import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSGeminiSchema } from "./gemini.schema";
import type {
  OryCMSGeminiSettingsPatch,
  OryCMSGeminiSettingsRecord,
  OryCMSGeminiSettingsWriteRecord,
} from "./gemini.types";

/**
 * Repository for orycms_gemini_settings — plain persistence only. No
 * encryption/decryption happens here (gemini.service.ts owns that) and no
 * permission checks happen here (routes gate access via
 * requireOryCMSPermission / guardOryCMS, same as every other OryCMS
 * repository). Mirrors whatsapp/whatsapp.repo.ts's shape.
 *
 * The table is a singleton: OryCMS runs exactly one Gemini configuration at
 * a time, so every method operates on "the" settings row rather than
 * taking an id.
 */

const COLUMNS = `id, enabled, "apiKey", model, temperature, "maxOutputTokens",
                 "systemInstruction", "businessContext", "autoReplyEnabled",
                 "createdAt", "updatedAt"`;

function notConfiguredError(): Error {
  return Object.assign(new Error("Gemini has not been configured yet."), {
    code: "GEMINI_SETTINGS_NOT_FOUND",
    statusCode: 404,
  });
}

// ── Read ───────────────────────────────────────────────────────────────────────

export async function getOryCMSGeminiSettings(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSGeminiSettingsRecord | null> {
  await ensureOryCMSGeminiSchema(pool);

  const result = await pool.query<OryCMSGeminiSettingsRecord>(
    `SELECT ${COLUMNS} FROM orycms_gemini_settings ORDER BY "createdAt" ASC LIMIT 1`,
  );
  return result.rows[0] ?? null;
}

// ── Write ──────────────────────────────────────────────────────────────────────

/**
 * Creates the Gemini settings row if none exists, or replaces every field
 * on the existing one (full-record upsert — matching the "save" naming
 * distinct from the partial "update" below).
 */
export async function saveOryCMSGeminiSettings(
  input: OryCMSGeminiSettingsWriteRecord,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSGeminiSettingsRecord> {
  await ensureOryCMSGeminiSchema(pool);

  const existing = await getOryCMSGeminiSettings(pool);

  if (existing) {
    const result = await pool.query<OryCMSGeminiSettingsRecord>(
      `UPDATE orycms_gemini_settings SET
         enabled = $1, "apiKey" = $2, model = $3, temperature = $4,
         "maxOutputTokens" = $5, "systemInstruction" = $6, "businessContext" = $7,
         "autoReplyEnabled" = $8, "updatedAt" = NOW()
       WHERE id = $9
       RETURNING ${COLUMNS}`,
      [
        input.enabled,
        input.apiKey,
        input.model,
        input.temperature,
        input.maxOutputTokens,
        input.systemInstruction,
        input.businessContext,
        input.autoReplyEnabled,
        existing.id,
      ],
    );
    return result.rows[0];
  }

  const result = await pool.query<OryCMSGeminiSettingsRecord>(
    `INSERT INTO orycms_gemini_settings
       (id, enabled, "apiKey", model, temperature, "maxOutputTokens",
        "systemInstruction", "businessContext", "autoReplyEnabled",
        "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING ${COLUMNS}`,
    [
      input.enabled,
      input.apiKey,
      input.model,
      input.temperature,
      input.maxOutputTokens,
      input.systemInstruction,
      input.businessContext,
      input.autoReplyEnabled,
    ],
  );
  return result.rows[0];
}

/**
 * Partial update of the existing settings row. Throws
 * GEMINI_SETTINGS_NOT_FOUND if nothing has been saved yet — callers that
 * want create-or-update semantics should use saveOryCMSGeminiSettings.
 */
export async function updateOryCMSGeminiSettings(
  patch: OryCMSGeminiSettingsPatch,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSGeminiSettingsRecord> {
  await ensureOryCMSGeminiSchema(pool);

  const existing = await getOryCMSGeminiSettings(pool);
  if (!existing) throw notConfiguredError();

  const merged: OryCMSGeminiSettingsWriteRecord = {
    enabled: patch.enabled ?? existing.enabled,
    apiKey: patch.apiKey !== undefined ? patch.apiKey : existing.apiKey,
    model: patch.model ?? existing.model,
    temperature: patch.temperature ?? existing.temperature,
    maxOutputTokens: patch.maxOutputTokens ?? existing.maxOutputTokens,
    systemInstruction:
      patch.systemInstruction !== undefined ? patch.systemInstruction : existing.systemInstruction,
    businessContext:
      patch.businessContext !== undefined ? patch.businessContext : existing.businessContext,
    autoReplyEnabled: patch.autoReplyEnabled ?? existing.autoReplyEnabled,
  };

  const result = await pool.query<OryCMSGeminiSettingsRecord>(
    `UPDATE orycms_gemini_settings SET
       enabled = $1, "apiKey" = $2, model = $3, temperature = $4,
       "maxOutputTokens" = $5, "systemInstruction" = $6, "businessContext" = $7,
       "autoReplyEnabled" = $8, "updatedAt" = NOW()
     WHERE id = $9
     RETURNING ${COLUMNS}`,
    [
      merged.enabled,
      merged.apiKey,
      merged.model,
      merged.temperature,
      merged.maxOutputTokens,
      merged.systemInstruction,
      merged.businessContext,
      merged.autoReplyEnabled,
      existing.id,
    ],
  );
  return result.rows[0];
}

export async function deleteOryCMSGeminiSettings(pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureOryCMSGeminiSchema(pool);
  await pool.query(`DELETE FROM orycms_gemini_settings`);
}
