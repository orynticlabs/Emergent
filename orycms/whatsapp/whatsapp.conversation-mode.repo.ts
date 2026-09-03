import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSWhatsAppConversationModeSchema } from "./whatsapp.conversation-mode.schema";
import type { OryCMSWhatsAppConversationMode } from "./whatsapp.conversation-mode.types";

/**
 * Repository for orycms_whatsapp_conversation_mode — plain persistence
 * only, no automation logic (that lives in whatsapp.ai-automation.service.ts).
 */

/** Defaults to "ai" when no row exists yet — every customer starts in AI Mode until an admin explicitly takes over. */
export async function getOryCMSWhatsAppConversationMode(
  customerId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppConversationMode> {
  await ensureOryCMSWhatsAppConversationModeSchema(pool);
  const result = await pool.query<{ mode: OryCMSWhatsAppConversationMode }>(
    `SELECT mode FROM orycms_whatsapp_conversation_mode WHERE "customerId" = $1 LIMIT 1`,
    [customerId],
  );
  return result.rows[0]?.mode ?? "ai";
}

/** Upserts the mode for one customer — INSERT if this is the first time it's been set, UPDATE otherwise. `updatedBy` (the admin's user id) is best-effort accountability, not enforced. */
export async function setOryCMSWhatsAppConversationMode(
  customerId: string,
  mode: OryCMSWhatsAppConversationMode,
  updatedBy: string | null,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await ensureOryCMSWhatsAppConversationModeSchema(pool);
  await pool.query(
    `INSERT INTO orycms_whatsapp_conversation_mode (id, "customerId", mode, "updatedBy", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
     ON CONFLICT ("customerId") DO UPDATE SET mode = $2, "updatedBy" = $3, "updatedAt" = NOW()`,
    [customerId, mode, updatedBy],
  );
}
