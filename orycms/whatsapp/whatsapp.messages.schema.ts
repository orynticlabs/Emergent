import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * WhatsApp conversation-history table — every inbound customer message and
 * every outbound message OryCMS actually sent (AI auto-reply, automated
 * menu text, or a manual admin reply), one row each, oldest first. This is
 * the storage the inbox (Step "Build a WhatsApp Inbox") reads from.
 * Idempotent DDL (IF NOT EXISTS), safe to run repeatedly, ensured lazily
 * on first use — the same pattern as every other *.schema.ts here.
 *
 * "sender" distinguishes who/what produced a message (customer / ai / menu
 * / admin) — see whatsapp.messages.types.ts's OryCMSWhatsAppMessageSender.
 * Not a CHECK-constrained enum, kept as free TEXT for the same reason
 * gemini's "model" column is: a values list living only in application
 * code is one less place a future addition needs a migration.
 */
const CREATE_WHATSAPP_MESSAGES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" TEXT NOT NULL,
  "contactName" TEXT,
  provider TEXT NOT NULL,
  direction TEXT NOT NULL,
  sender TEXT NOT NULL,
  "providerMessageId" TEXT,
  text TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orycms_whatsapp_messages_customer_created_idx
  ON orycms_whatsapp_messages ("customerId", "createdAt" ASC);

CREATE INDEX IF NOT EXISTS orycms_whatsapp_messages_created_idx
  ON orycms_whatsapp_messages ("createdAt" DESC);
`;

let ensured = false;

/**
 * Creates the messages table if it doesn't exist yet. Cheap to call on
 * every webhook/inbox request (CREATE ... IF NOT EXISTS is a no-op after
 * the first call), but cached per-process anyway so steady-state requests
 * skip the round trip entirely.
 */
export async function ensureOryCMSWhatsAppMessagesSchema(
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_WHATSAPP_MESSAGES_SCHEMA_SQL);
  ensured = true;
}
