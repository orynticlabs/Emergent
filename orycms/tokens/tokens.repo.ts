import crypto from "crypto";
import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSTokenType = "invite" | "activation" | "reset" | "mfa_setup" | "mfa_login";

export interface OryCMSCreateTokenInput {
  type: OryCMSTokenType;
  email: string;
  userId?: string | null;
  /** Time-to-live in milliseconds. Defaults per type below. */
  ttlMs?: number;
  metadata?: Record<string, unknown> | null;
}

export interface OryCMSConsumedToken {
  id: string;
  type: OryCMSTokenType;
  userId: string | null;
  email: string;
  metadata: Record<string, unknown> | null;
}

// Sensible defaults: invites live a week, activation 3 days, resets 1 hour,
// MFA setup windows 10 minutes (short-lived — the pending secret it carries
// must never outlive the dialog it was generated for), MFA login challenges
// also 10 minutes (the window between "password verified" and "OTP entered").
const DEFAULT_TTL_MS: Record<OryCMSTokenType, number> = {
  invite: 7 * 24 * 60 * 60 * 1000,
  activation: 3 * 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
  mfa_setup: 10 * 60 * 1000,
  mfa_login: 10 * 60 * 1000,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// ── Create ─────────────────────────────────────────────────────────────────────

/**
 * Create a single-use token. Returns the RAW token (put in the link/email);
 * only its SHA-256 hash is stored — same at-rest model as session tokens.
 */
export async function createOryCMSToken(
  input: OryCMSCreateTokenInput,
  pool: Pool = getOryCMSPool(),
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const ttl = input.ttlMs ?? DEFAULT_TTL_MS[input.type];
  const expiresAt = new Date(Date.now() + ttl).toISOString();

  await pool.query(
    `INSERT INTO orycms_tokens
       (id, "userId", type, "tokenHash", email, "expiresAt", metadata, "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
    [
      input.userId ?? null,
      input.type,
      tokenHash,
      input.email.toLowerCase().trim(),
      expiresAt,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  );

  return rawToken;
}

// ── Consume ────────────────────────────────────────────────────────────────────

/**
 * Validate and consume a token: it must exist, match the expected type, be
 * unexpired and unused. Marks usedAt on success (single-use). Throws
 * OryCMSAuthError("INVALID_CREDENTIALS", 400) on any failure — the same generic
 * error for missing/expired/used, so callers can't distinguish (no enumeration).
 */
export async function consumeOryCMSToken(
  type: OryCMSTokenType,
  rawToken: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSConsumedToken> {
  const tokenHash = hashToken(rawToken);

  // Atomically mark used only if currently valid; RETURNING tells us if it worked.
  const result = await pool.query<OryCMSConsumedToken>(
    `UPDATE orycms_tokens
     SET "usedAt" = NOW()
     WHERE "tokenHash" = $1
       AND type = $2
       AND "usedAt" IS NULL
       AND "expiresAt" > NOW()
     RETURNING id, type, "userId", email, metadata`,
    [tokenHash, type],
  );

  const token = result.rows[0];
  if (!token) {
    throw new OryCMSAuthError(
      "INVALID_CREDENTIALS",
      "This link is invalid or has expired.",
      400,
    );
  }

  return token;
}

// ── Peek ───────────────────────────────────────────────────────────────────────

/**
 * Validate a token WITHOUT consuming it: same match/expiry/unused checks as
 * {@link consumeOryCMSToken}, but no UPDATE. For flows that need to check a
 * value against token metadata (e.g. an MFA code) and allow retries — the
 * token should only be burned by an explicit consumeOryCMSToken call once the
 * caller-side check passes.
 */
export async function peekOryCMSToken(
  type: OryCMSTokenType,
  rawToken: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSConsumedToken> {
  const tokenHash = hashToken(rawToken);

  const result = await pool.query<OryCMSConsumedToken>(
    `SELECT id, type, "userId", email, metadata
     FROM orycms_tokens
     WHERE "tokenHash" = $1
       AND type = $2
       AND "usedAt" IS NULL
       AND "expiresAt" > NOW()
     LIMIT 1`,
    [tokenHash, type],
  );

  const token = result.rows[0];
  if (!token) {
    throw new OryCMSAuthError(
      "INVALID_CREDENTIALS",
      "This link is invalid or has expired.",
      400,
    );
  }

  return token;
}

// ── Attempt limiting ───────────────────────────────────────────────────────────

export interface OryCMSTokenAttemptResult {
  attempts: number;
  /** True when this call pushed the token over maxAttempts — it was invalidated (usedAt set) as part of the same update. */
  locked: boolean;
}

/**
 * Atomically increments a `metadata.attempts` counter on a valid (unexpired,
 * unused) token and, in the SAME statement, invalidates the token (sets
 * usedAt) once the count reaches `maxAttempts` — for challenges where a
 * caller-side check (e.g. an OTP) can be retried a bounded number of times.
 *
 * Single UPDATE ... WHERE ... RETURNING, so it's race-safe: concurrent calls
 * for the same token serialize on Postgres's row lock, and each one re-reads
 * the just-committed count before computing its own increment — no lost
 * updates, and no way to slip past maxAttempts via a race.
 *
 * Returns null when the token isn't currently valid (already used, already
 * locked out by a prior call, expired, or never existed) — callers treat
 * that the same as any other invalid-token case.
 */
export async function incrementOryCMSTokenAttempts(
  type: OryCMSTokenType,
  rawToken: string,
  maxAttempts: number,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTokenAttemptResult | null> {
  const tokenHash = hashToken(rawToken);

  const result = await pool.query<{ attempts: number; locked: boolean }>(
    `UPDATE orycms_tokens
     SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{attempts}',
           to_jsonb(COALESCE((metadata->>'attempts')::int, 0) + 1)
         ),
         "usedAt" = CASE
           WHEN COALESCE((metadata->>'attempts')::int, 0) + 1 >= $3 THEN NOW()
           ELSE "usedAt"
         END
     WHERE "tokenHash" = $1
       AND type = $2
       AND "usedAt" IS NULL
       AND "expiresAt" > NOW()
     RETURNING
       (metadata->>'attempts')::int AS attempts,
       ("usedAt" IS NOT NULL) AS locked`,
    [tokenHash, type, maxAttempts],
  );

  return result.rows[0] ?? null;
}
