import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSWhatsAppAutomationSchema } from "./whatsapp.automation.schema";

/**
 * Repository for orycms_whatsapp_processed_messages — plain persistence
 * only, no automation logic (that lives in whatsapp.ai-automation.service.ts,
 * matching the split every other OryCMS repository/service pair follows).
 */

/**
 * Atomically claims a messageId: returns true the first time this id is
 * seen (the caller should proceed with processing), false if it's already
 * been claimed before (the caller must skip — this is the entire duplicate
 * -protection mechanism, race-safe because the database's UNIQUE
 * constraint + ON CONFLICT DO NOTHING is what decides the winner, not an
 * application-level check-then-write).
 */
export async function claimOryCMSWhatsAppMessage(
  messageId: string,
  provider: string,
  pool: Pool = getOryCMSPool(),
): Promise<boolean> {
  await ensureOryCMSWhatsAppAutomationSchema(pool);

  const result = await pool.query(
    `INSERT INTO orycms_whatsapp_processed_messages (id, "messageId", provider, status, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, 'received', NOW(), NOW())
     ON CONFLICT ("messageId") DO NOTHING
     RETURNING id`,
    [messageId, provider],
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Records the outcome of processing an already-claimed message — a short
 * status label only (see whatsapp.automation.schema.ts's header for the
 * values used). Never stores message content, phone numbers, or generated
 * text. Best-effort: a failure here must not be allowed to change the
 * webhook's response to WhatsApp, so callers should not let a rejection
 * here escalate into anything the webhook route reacts to.
 */
export async function markOryCMSWhatsAppMessageStatus(
  messageId: string,
  status: string,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await ensureOryCMSWhatsAppAutomationSchema(pool);
  await pool.query(
    `UPDATE orycms_whatsapp_processed_messages SET status = $1, "updatedAt" = NOW() WHERE "messageId" = $2`,
    [status, messageId],
  );
}
