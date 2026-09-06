import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSWhatsAppMenuSessionSchema } from "./whatsapp.menu-session.schema";

/**
 * Repository for orycms_whatsapp_menu_sessions — plain persistence only,
 * no automation logic (that lives in whatsapp.ai-automation.service.ts).
 */

export async function isOryCMSWhatsAppCustomerAwaitingMenuSelection(
  customerId: string,
  pool: Pool = getOryCMSPool(),
): Promise<boolean> {
  await ensureOryCMSWhatsAppMenuSessionSchema(pool);
  const result = await pool.query<{ awaitingSelection: boolean }>(
    `SELECT "awaitingSelection" FROM orycms_whatsapp_menu_sessions WHERE "customerId" = $1 LIMIT 1`,
    [customerId],
  );
  return result.rows[0]?.awaitingSelection ?? false;
}

/** Upserts the flag for one customer — INSERT if this is the first time they've been seen, UPDATE otherwise. */
export async function setOryCMSWhatsAppCustomerAwaitingMenuSelection(
  customerId: string,
  awaitingSelection: boolean,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await ensureOryCMSWhatsAppMenuSessionSchema(pool);
  await pool.query(
    `INSERT INTO orycms_whatsapp_menu_sessions (id, "customerId", "awaitingSelection", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
     ON CONFLICT ("customerId") DO UPDATE SET "awaitingSelection" = $2, "updatedAt" = NOW()`,
    [customerId, awaitingSelection],
  );
}
