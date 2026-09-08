import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * Configuration tables for the WhatsApp menu builder - Step 10. Two
 * tables, mirroring the payments module's split (orycms_payment_links +
 * orycms_payments): one singleton settings row (enabled + welcome
 * message) and one row per numbered option. Idempotent DDL (IF NOT
 * EXISTS), safe to run repeatedly, ensured lazily on first use - the same
 * pattern as every other *.schema.ts in this codebase.
 *
 * "number" is CHECK-constrained to 1-9 and UNIQUE at the database level -
 * the same range the admin UI enforces, kept here too so a race between
 * two saves (or a future direct DB edit) can't produce two options
 * claiming the same number.
 */
const CREATE_WHATSAPP_MENU_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_whatsapp_menu_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT false,
  "welcomeMessage" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orycms_whatsapp_menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 9),
  title TEXT NOT NULL,
  "aiInstructions" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (number)
);

CREATE INDEX IF NOT EXISTS orycms_whatsapp_menu_options_number_idx
  ON orycms_whatsapp_menu_options (number ASC);
`;

let ensured = false;

/**
 * Creates both menu tables if they don't exist yet. Cheap to call on every
 * request (CREATE ... IF NOT EXISTS is a no-op after the first call), but
 * cached per-process anyway so steady-state requests skip the round trip
 * entirely.
 */
export async function ensureOryCMSWhatsAppMenuSchema(pool: Pool = getOryCMSPool()): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_WHATSAPP_MENU_SCHEMA_SQL);
  ensured = true;
}
