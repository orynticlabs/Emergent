import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import {
  ORYCMS_GEMINI_DEFAULT_MAX_OUTPUT_TOKENS,
  ORYCMS_GEMINI_DEFAULT_MODEL,
  ORYCMS_GEMINI_DEFAULT_TEMPERATURE,
} from "./gemini.types";

/**
 * Configuration table for the Gemini AI plugin. Holds Gemini credentials,
 * generation defaults, and (as of Step 5) business-defined AI behavior
 * instructions; no conversations, knowledge base, or usage log tables —
 * still configuration only. Idempotent DDL (IF NOT EXISTS), safe to run
 * repeatedly, ensured lazily on first use — the same pattern as
 * payments.schema.ts, auth/mfa.schema.ts, and whatsapp/whatsapp.schema.ts.
 *
 * "model" is a free-text column, not a CHECK-constrained enum like
 * whatsapp's "provider" — Google adds/retires Gemini model ids on its own
 * schedule, so constraining it here would require a migration every time
 * that happens. ORYCMS_GEMINI_MODELS (gemini.types.ts) is just the
 * suggested list the UI's selector offers.
 *
 * "systemInstruction" and "businessContext" are plain TEXT, not encrypted
 * like "apiKey" — they are business-authored behavior instructions, not
 * credentials, and Step 5 doesn't ask for them to be encrypted at rest.
 * They are still never written to application logs (see gemini.service.ts
 * and the settings route's audit-log calls) since they may contain
 * business-sensitive pricing/policy language even though they aren't
 * secrets in the encryption sense.
 */
const CREATE_GEMINI_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_gemini_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT false,
  "apiKey" TEXT,
  model TEXT NOT NULL DEFAULT '${ORYCMS_GEMINI_DEFAULT_MODEL}',
  temperature REAL NOT NULL DEFAULT ${ORYCMS_GEMINI_DEFAULT_TEMPERATURE},
  "maxOutputTokens" INTEGER NOT NULL DEFAULT ${ORYCMS_GEMINI_DEFAULT_MAX_OUTPUT_TOKENS},
  "systemInstruction" TEXT,
  "businessContext" TEXT,
  "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orycms_gemini_settings_created_at_idx
  ON orycms_gemini_settings ("createdAt" ASC);
`;

/**
 * "systemInstruction", "businessContext", and "autoReplyEnabled" were added
 * in Step 5, after the table above already shipped in Step 3. Applied
 * additively so a database that already ran Step 3's CREATE TABLE picks
 * them up too — the same "ALTER ... ADD COLUMN IF NOT EXISTS" pattern
 * whatsapp.schema.ts used for its Step 2 "appId" addition.
 */
const ENSURE_INSTRUCTION_COLUMNS_SQL = `
ALTER TABLE orycms_gemini_settings ADD COLUMN IF NOT EXISTS "systemInstruction" TEXT;
ALTER TABLE orycms_gemini_settings ADD COLUMN IF NOT EXISTS "businessContext" TEXT;
ALTER TABLE orycms_gemini_settings ADD COLUMN IF NOT EXISTS "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT false;
`;

let ensured = false;

/**
 * Creates the Gemini settings table if it doesn't exist yet, and applies
 * any additive column changes on top of it. Cheap to call on every request
 * (every statement is IF NOT EXISTS — a no-op after the first successful
 * run), but cached per-process anyway so steady-state requests skip the
 * round trip entirely.
 */
export async function ensureOryCMSGeminiSchema(pool: Pool = getOryCMSPool()): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_GEMINI_SCHEMA_SQL);
  await pool.query(ENSURE_INSTRUCTION_COLUMNS_SQL);
  ensured = true;
}
