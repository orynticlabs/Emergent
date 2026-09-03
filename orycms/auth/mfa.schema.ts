import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * MFA columns on `orycms_users`, applied additively to a table that already
 * exists (created once by the core collection installer — see
 * orycms/core/core.migration.ts, which never re-runs for an already-migrated
 * database). This mirrors the idempotent "ALTER ... ADD COLUMN IF NOT
 * EXISTS" pattern used elsewhere in this codebase (e.g. orycms_companies) to
 * evolve a table after its initial install.
 *
 * Column names are quoted camelCase to match every other column already on
 * orycms_users (passwordHash, roleId, createdAt, ...) — unlike the snake_case
 * convention used on newer tables (orycms_companies, orycms_announcements).
 *
 * "mfaSecret" holds the TOTP secret in ENCRYPTED form (AES-256-GCM, see
 * mfa.crypto.ts), never plaintext. "mfaSecretIv" is the per-record
 * initialization vector that encryption requires.
 */
const ENSURE_MFA_COLUMNS_SQL = `
ALTER TABLE orycms_users ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orycms_users ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT;
ALTER TABLE orycms_users ADD COLUMN IF NOT EXISTS "mfaSecretIv" TEXT;
ALTER TABLE orycms_users ADD COLUMN IF NOT EXISTS "mfaEnabledAt" TIMESTAMPTZ;
`;

/**
 * orycms_tokens.type carries a Postgres CHECK constraint generated from the
 * "type" select field's options at the table's original install time (see
 * field.mapper.ts — a select field becomes `VARCHAR CHECK (type IN (...))`).
 * That happened before "mfa_setup"/"mfa_login" existed as token types, and
 * the core schema installer never re-runs against an already-migrated
 * database (see core.migration.ts), so the live constraint is stuck with
 * whatever options existed at install time. Re-declaring the constraint here
 * (DROP IF EXISTS + ADD, both idempotent/safe to repeat) keeps it in sync
 * with OryCMSTokenType in tokens.repo.ts and core.collections.ts's
 * documented options — every value that union currently allows, plus the
 * legacy set, so this only ever widens the constraint, never narrows it out
 * from under existing rows.
 */
const ENSURE_TOKEN_TYPES_SQL = `
ALTER TABLE orycms_tokens DROP CONSTRAINT IF EXISTS orycms_tokens_type_check;
ALTER TABLE orycms_tokens ADD CONSTRAINT orycms_tokens_type_check
  CHECK (type IN ('invite', 'activation', 'reset', 'mfa_setup', 'mfa_login'));
`;

export async function ensureOryCMSMfaSchema(pool: Pool = getOryCMSPool()): Promise<void> {
  await pool.query(ENSURE_MFA_COLUMNS_SQL);
  await pool.query(ENSURE_TOKEN_TYPES_SQL);
}
