import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * Per-customer AI/Human conversation mode for the human-handoff feature.
 * A separate table from orycms_whatsapp_menu_sessions on purpose - that
 * table is menu-selection state specifically; this is a broader "should
 * automation touch this customer at all" switch that applies whether or
 * not the menu is enabled. Idempotent DDL (IF NOT EXISTS), safe to run
 * repeatedly, ensured lazily on first use - the same pattern as every
 * other *.schema.ts here.
 *
 * No message content lives here - only a customerId, the mode, and (best
 * effort) which admin last changed it, for accountability.
 */
const CREATE_WHATSAPP_CONVERSATION_MODE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_whatsapp_conversation_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
  "updatedBy" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

let ensured = false;

/**
 * Creates the conversation-mode table if it doesn't exist yet. Cheap to
 * call on every webhook/inbox request (CREATE ... IF NOT EXISTS is a
 * no-op after the first call), but cached per-process anyway so
 * steady-state requests skip the round trip entirely.
 */
export async function ensureOryCMSWhatsAppConversationModeSchema(
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_WHATSAPP_CONVERSATION_MODE_SCHEMA_SQL);
  ensured = true;
}
