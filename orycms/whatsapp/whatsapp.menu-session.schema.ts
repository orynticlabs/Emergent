import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * Minimal per-customer state for the menu automation flow - NOT
 * conversation history and NOT customer memory (both explicitly out of
 * scope): a single boolean, "are we currently waiting for this customer to
 * reply with a menu number." Nothing about what they said, what they
 * picked before, or any content is stored - only "customerId" (their
 * WhatsApp id/phone, already known to WhatsApp itself) and a flag.
 *
 * This is the smallest piece of state that makes "on first message, send
 * the welcome menu" and "if the customer replies with a number, treat it
 * as a menu selection" distinguishable at all - without it there would be
 * no way to tell a customer's very first message apart from a later one.
 * Idempotent DDL (IF NOT EXISTS), safe to run repeatedly, ensured lazily
 * on first use - the same pattern as every other *.schema.ts here.
 */
const CREATE_WHATSAPP_MENU_SESSION_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_whatsapp_menu_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" TEXT NOT NULL UNIQUE,
  "awaitingSelection" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

let ensured = false;

/**
 * Creates the menu-session table if it doesn't exist yet. Cheap to call on
 * every webhook request (CREATE ... IF NOT EXISTS is a no-op after the
 * first call), but cached per-process anyway so steady-state requests
 * skip the round trip entirely.
 */
export async function ensureOryCMSWhatsAppMenuSessionSchema(
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_WHATSAPP_MENU_SESSION_SCHEMA_SQL);
  ensured = true;
}
