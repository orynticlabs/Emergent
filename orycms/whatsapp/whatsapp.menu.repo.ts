import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSWhatsAppMenuSchema } from "./whatsapp.menu.schema";
import type {
  OryCMSWhatsAppMenuOptionInput,
  OryCMSWhatsAppMenuOptionRecord,
  OryCMSWhatsAppMenuSettingsRecord,
} from "./whatsapp.menu.types";

/**
 * Repository for orycms_whatsapp_menu_settings + orycms_whatsapp_menu_options
 * - plain persistence only, no validation (that lives in
 * whatsapp.menu.service.ts, matching the split every other OryCMS
 * repository/service pair in this codebase follows) and no permission
 * checks (routes gate access via requireOryCMSPermission / guardOryCMS).
 *
 * Both tables are singleton-scoped: OryCMS has exactly one WhatsApp menu
 * at a time, so getOryCMSWhatsAppMenuSettings/saveOryCMSWhatsAppMenuSettings
 * operate on "the" settings row rather than taking an id - same convention
 * as whatsapp.repo.ts and gemini.repo.ts.
 */

const SETTINGS_COLUMNS = `id, enabled, "welcomeMessage", "createdAt", "updatedAt"`;
const OPTION_COLUMNS = `id, number, title, "aiInstructions", "createdAt", "updatedAt"`;

// ── Settings (enabled + welcome message) ────────────────────────────────────────

export async function getOryCMSWhatsAppMenuSettings(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppMenuSettingsRecord | null> {
  await ensureOryCMSWhatsAppMenuSchema(pool);
  const result = await pool.query<OryCMSWhatsAppMenuSettingsRecord>(
    `SELECT ${SETTINGS_COLUMNS} FROM orycms_whatsapp_menu_settings ORDER BY "createdAt" ASC LIMIT 1`,
  );
  return result.rows[0] ?? null;
}

/** Creates the settings row if none exists, or replaces enabled/welcomeMessage on the existing one (full upsert, same shape as whatsapp.repo.ts/gemini.repo.ts's saveSettings). */
export async function saveOryCMSWhatsAppMenuSettings(
  input: { enabled: boolean; welcomeMessage: string | null },
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppMenuSettingsRecord> {
  await ensureOryCMSWhatsAppMenuSchema(pool);

  const existing = await getOryCMSWhatsAppMenuSettings(pool);
  if (existing) {
    const result = await pool.query<OryCMSWhatsAppMenuSettingsRecord>(
      `UPDATE orycms_whatsapp_menu_settings SET enabled = $1, "welcomeMessage" = $2, "updatedAt" = NOW()
       WHERE id = $3
       RETURNING ${SETTINGS_COLUMNS}`,
      [input.enabled, input.welcomeMessage, existing.id],
    );
    return result.rows[0];
  }

  const result = await pool.query<OryCMSWhatsAppMenuSettingsRecord>(
    `INSERT INTO orycms_whatsapp_menu_settings (id, enabled, "welcomeMessage", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
     RETURNING ${SETTINGS_COLUMNS}`,
    [input.enabled, input.welcomeMessage],
  );
  return result.rows[0];
}

// ── Options ──────────────────────────────────────────────────────────────────

export async function listOryCMSWhatsAppMenuOptions(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppMenuOptionRecord[]> {
  await ensureOryCMSWhatsAppMenuSchema(pool);
  const result = await pool.query<OryCMSWhatsAppMenuOptionRecord>(
    `SELECT ${OPTION_COLUMNS} FROM orycms_whatsapp_menu_options ORDER BY number ASC`,
  );
  return result.rows;
}

/**
 * Atomically replaces the entire option list - the whole DELETE + re-INSERT
 * runs in one transaction (BEGIN/COMMIT/ROLLBACK via a dedicated client,
 * matching the transaction pattern already used in
 * orycms/migrations/migration.engine.ts and orycms/schema/schema.persistence.ts),
 * so a failure partway through can never leave the menu with a partial
 * option list. This is how add/edit/delete of individual options are all
 * expressed through one PATCH call - see whatsapp.menu.service.ts.
 */
export async function replaceOryCMSWhatsAppMenuOptions(
  options: OryCMSWhatsAppMenuOptionInput[],
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppMenuOptionRecord[]> {
  await ensureOryCMSWhatsAppMenuSchema(pool);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM orycms_whatsapp_menu_options`);

    const inserted: OryCMSWhatsAppMenuOptionRecord[] = [];
    for (const option of options) {
      const result = await client.query<OryCMSWhatsAppMenuOptionRecord>(
        `INSERT INTO orycms_whatsapp_menu_options (id, number, title, "aiInstructions", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         RETURNING ${OPTION_COLUMNS}`,
        [option.number, option.title, option.aiInstructions ?? null],
      );
      inserted.push(result.rows[0]);
    }

    await client.query("COMMIT");
    inserted.sort((a, b) => a.number - b.number);
    return inserted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
