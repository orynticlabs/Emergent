import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ORYCMS_WHATSAPP_PROVIDERS } from "./whatsapp.types";

/**
 * Configuration table for the WhatsApp module. Holds one connector's
 * settings (provider + credentials + webhook toggle); no conversations,
 * messages, or templates tables yet. Idempotent DDL (IF NOT EXISTS), safe
 * to run repeatedly, ensured lazily on first use — the same pattern as
 * payments.schema.ts and auth/mfa.schema.ts.
 *
 * "provider" is constrained to the full set of providers the schema is
 * designed to support (see whatsapp.types.ts), even though only "meta" is
 * implemented — so adding Twilio/360dialog/Gupshup/Interakt later never
 * requires a column or constraint migration, only a client implementation.
 */
const CREATE_WHATSAPP_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'meta'
    CHECK (provider IN (${ORYCMS_WHATSAPP_PROVIDERS.map((p) => `'${p}'`).join(", ")})),
  enabled BOOLEAN NOT NULL DEFAULT false,
  "displayName" TEXT,
  "accessToken" TEXT,
  "phoneNumberId" TEXT,
  "businessAccountId" TEXT,
  "appId" TEXT,
  "verifyToken" TEXT,
  "appSecret" TEXT,
  "webhookEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orycms_whatsapp_settings_created_at_idx
  ON orycms_whatsapp_settings ("createdAt" ASC);
`;

/**
 * "appId" (Meta App ID, used later for webhook subscription management) was
 * added in Step 2, after the table above already shipped in Step 1. Applied
 * additively so a database that already ran Step 1's CREATE TABLE picks it
 * up too — the same "ALTER ... ADD COLUMN IF NOT EXISTS" pattern
 * auth/mfa.schema.ts uses to evolve orycms_users after its initial install.
 */
const ENSURE_APP_ID_COLUMN_SQL = `
ALTER TABLE orycms_whatsapp_settings ADD COLUMN IF NOT EXISTS "appId" TEXT;
`;

let ensured = false;

/**
 * Creates the WhatsApp settings table if it doesn't exist yet, and applies
 * any additive column changes on top of it. Cheap to call on every request
 * (every statement is IF NOT EXISTS — a no-op after the first successful
 * run), but cached per-process anyway so steady-state requests skip the
 * round trip entirely.
 */
export async function ensureOryCMSWhatsAppSchema(pool: Pool = getOryCMSPool()): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_WHATSAPP_SCHEMA_SQL);
  await pool.query(ENSURE_APP_ID_COLUMN_SQL);
  ensured = true;
}
