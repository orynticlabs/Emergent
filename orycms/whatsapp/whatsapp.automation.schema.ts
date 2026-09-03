import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * Dedup/observability table for the AI auto-reply flow — Step 8. Holds one
 * row per WhatsApp messageId this OryCMS instance has seen, so a retried
 * webhook delivery (Meta retries on anything other than a fast 2xx, and
 * can also legitimately redeliver) can never trigger a second AI reply for
 * the same inbound message. Idempotent DDL (IF NOT EXISTS), safe to run
 * repeatedly, ensured lazily on first use — the same pattern as
 * payments.schema.ts, whatsapp.schema.ts, and gemini.schema.ts.
 *
 * The UNIQUE constraint on "messageId" is what makes dedup atomic and
 * race-safe: whatsapp.automation.repo.ts claims a message with
 * `INSERT ... ON CONFLICT ("messageId") DO NOTHING`, so two concurrent
 * webhook deliveries for the same message can never both "win" the claim,
 * even without an application-level lock.
 *
 * "status" is a free-text observability field (not a CHECK-constrained
 * enum) — see whatsapp.ai-automation.service.ts for the values it's
 * currently written with (replied / skipped_* / failed_*). No message
 * content, phone numbers, or generated text are ever stored here — only
 * the provider's message id and a short outcome label.
 */
const CREATE_WHATSAPP_AUTOMATION_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_whatsapp_processed_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "messageId" TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orycms_whatsapp_processed_messages_created_at_idx
  ON orycms_whatsapp_processed_messages ("createdAt" DESC);
`;

let ensured = false;

/**
 * Creates the dedup table if it doesn't exist yet. Cheap to call on every
 * webhook request (CREATE ... IF NOT EXISTS is a no-op after the first
 * call), but cached per-process anyway so steady-state requests skip the
 * round trip entirely.
 */
export async function ensureOryCMSWhatsAppAutomationSchema(
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_WHATSAPP_AUTOMATION_SCHEMA_SQL);
  ensured = true;
}
