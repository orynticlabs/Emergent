import { authenticator } from "otplib";
import QRCode from "qrcode";
import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import {
  createOryCMSToken,
  peekOryCMSToken,
  consumeOryCMSToken,
  incrementOryCMSTokenAttempts,
} from "@/tokens";
import { OryCMSAuthError } from "./auth.errors";
import { verifyOryCMSUserPassword } from "./auth";
import { encryptOryCMSMfaSecret, decryptOryCMSMfaSecret } from "./mfa.crypto";

/**
 * MFA enrollment flow, in two steps:
 *
 * 1. startOryCMSMfaSetup - generates a TOTP secret and hands it to the client
 *    as a QR code + manual key, without ever writing it to `orycms_users`.
 *    The secret only lives in a short-lived `orycms_tokens` row (type
 *    "mfa_setup", 10 min TTL - see tokens.repo.ts) keyed by an opaque setup
 *    token, mirroring the same single-use-token model already used for
 *    invite/activation/reset links.
 *
 * 2. verifyOryCMSMfaSetupCode - checks the user's first authenticator code
 *    against that pending secret and, only on success, encrypts it
 *    (mfa.crypto.ts) and activates MFA on the user record.
 */

const MFA_ISSUER = "OryCMS";

export interface OryCMSMfaSetup {
  /** Opaque handle for this pending enrollment - the client echoes it back on verify. */
  setupToken: string;
  /** Base32 secret, shown as a fallback for manual entry into the authenticator app. */
  manualKey: string;
  /** `data:image/png;base64,...` QR code encoding the otpauth:// URI. */
  qrCodeDataUrl: string;
}

/**
 * Starts a new MFA enrollment for the given user: generates a fresh TOTP
 * secret, builds its otpauth:// URI (issuer "OryCMS", account = the user's
 * own email - never client-supplied), renders it as a QR code, and stashes
 * the secret in a single-use setup token so `verifyOryCMSMfaSetupCode` can
 * check a submitted code against it later.
 */
export async function startOryCMSMfaSetup(
  userId: string,
  email: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMfaSetup> {
  const secret = authenticator.generateSecret();
  const otpauthUri = authenticator.keyuri(email, MFA_ISSUER, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

  const setupToken = await createOryCMSToken(
    { type: "mfa_setup", email, userId, metadata: { secret } },
    pool,
  );

  return { setupToken, manualKey: secret, qrCodeDataUrl };
}

/**
 * Flips `mfaEnabled` on for a user and stores their encrypted secret -
 * atomically, and only if MFA isn't already enabled. The `"mfaEnabled" =
 * FALSE` guard in the WHERE clause makes this race-safe: if two requests
 * both reach here for the same user, only the first UPDATE (whichever
 * commits first) actually changes the row; Postgres serializes concurrent
 * UPDATEs to the same row, so the second one re-evaluates the guard against
 * the now-committed state and matches zero rows instead of clobbering the
 * first activation's secret.
 *
 * Returns null (no rows updated) when MFA was already enabled - callers
 * treat that as "already active", never as silent success.
 */
async function activateOryCMSMfaForUser(
  userId: string,
  encrypted: string,
  iv: string,
  pool: Pool,
): Promise<{ mfaEnabledAt: string } | null> {
  const result = await pool.query<{ mfaEnabledAt: string }>(
    `UPDATE orycms_users
     SET "mfaSecret" = $1, "mfaSecretIv" = $2, "mfaEnabled" = TRUE, "mfaEnabledAt" = NOW()
     WHERE id = $3 AND "mfaEnabled" = FALSE
     RETURNING "mfaEnabledAt"`,
    [encrypted, iv, userId],
  );
  return result.rows[0] ?? null;
}

/**
 * Verifies the first authenticator code for a pending enrollment and, on
 * success, activates MFA for the account: encrypts the secret, persists it
 * with `mfaEnabled = true` / `mfaEnabledAt = NOW()`, and only then burns the
 * setup token. `requesterUserId` (the caller's own session) must match the
 * token's owner - checked BEFORE any code check or DB write, so a setup
 * token can never activate MFA on an account other than the one it was
 * issued for.
 *
 * Uses peek-then-consume on the token: an invalid code leaves it intact so
 * the user can retry without restarting enrollment; only a code that passes
 * AND a successful (non-racing) activation burns it.
 */
export async function verifyOryCMSMfaSetupCode(
  requesterUserId: string,
  setupToken: string,
  code: string,
  pool: Pool = getOryCMSPool(),
): Promise<{ mfaEnabledAt: string }> {
  const token = await peekOryCMSToken("mfa_setup", setupToken, pool);
  const secret = typeof token.metadata?.secret === "string" ? token.metadata.secret : null;

  if (!secret || !token.userId) {
    throw new OryCMSAuthError(
      "INVALID_CREDENTIALS",
      "This setup session is invalid or has expired.",
      400,
    );
  }

  if (token.userId !== requesterUserId) {
    throw new OryCMSAuthError(
      "UNAUTHORIZED",
      "This setup session belongs to another account.",
      401,
    );
  }

  if (!authenticator.check(code, secret)) {
    throw Object.assign(
      new Error("That code didn't match. Check your authenticator app and try again."),
      { code: "INVALID_MFA_CODE", statusCode: 422 },
    );
  }

  const { encrypted, iv } = encryptOryCMSMfaSecret(secret);
  const activated = await activateOryCMSMfaForUser(requesterUserId, encrypted, iv, pool);
  if (!activated) {
    throw Object.assign(new Error("MFA is already enabled for this account."), {
      code: "MFA_ALREADY_ENABLED",
      statusCode: 409,
    });
  }

  await consumeOryCMSToken("mfa_setup", setupToken, pool);
  return activated;
}

/**
 * Login-time MFA challenge: the step between "password verified" and "real
 * session created" for accounts that have MFA enabled. Mirrors the setup
 * flow's single-use-token model (type "mfa_login" - see tokens.repo.ts) but
 * the token itself carries nothing sensitive: no secret, no password, no
 * decrypted anything. It only proves "this caller already passed the
 * password check for this userId, recently" - the actual TOTP check happens
 * server-side in verifyOryCMSMfaLoginCode against the encrypted secret
 * already on the user's row.
 */

const MFA_LOGIN_MAX_ATTEMPTS = 5;

export interface OryCMSMfaLoginChallenge {
  /** Opaque handle for the pending login - the client echoes it back on login-verify. Never a cookie. */
  challengeToken: string;
}

/**
 * Issues a 10-minute, single-use login challenge for a user who has already
 * passed the password check. Callers must NOT create a session or set the
 * session cookie when this is used - that only happens after
 * verifyOryCMSMfaLoginCode succeeds.
 */
export async function createOryCMSMfaLoginChallenge(
  userId: string,
  email: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMfaLoginChallenge> {
  const challengeToken = await createOryCMSToken({ type: "mfa_login", email, userId }, pool);
  return { challengeToken };
}

/** Scoped read of exactly what login-time MFA verification needs - never `SELECT *`, never touched outside this check. */
async function getOryCMSMfaCredentials(
  userId: string,
  pool: Pool,
): Promise<{ mfaEnabled: boolean; mfaSecret: string | null; mfaSecretIv: string | null } | null> {
  const result = await pool.query<{
    mfaEnabled: boolean;
    mfaSecret: string | null;
    mfaSecretIv: string | null;
  }>(`SELECT "mfaEnabled", "mfaSecret", "mfaSecretIv" FROM orycms_users WHERE id = $1 LIMIT 1`, [
    userId,
  ]);
  return result.rows[0] ?? null;
}

/**
 * Verifies a submitted TOTP code against a pending login challenge.
 *
 * Success: consumes the challenge (single-use - replay-proof, same
 * peek-then-consume model as everywhere else) and returns the userId the
 * caller should now create a real session for. This is the ONLY function in
 * the login-MFA path that returns a positive result, and it never returns
 * anything except the userId - no secret, no session, no cookie (the caller
 * owns session creation).
 *
 * Failure: atomically increments the challenge's attempt counter via
 * incrementOryCMSTokenAttempts (a single race-safe UPDATE - see
 * tokens.repo.ts) and, once MFA_LOGIN_MAX_ATTEMPTS (5) is reached, the same
 * update invalidates the challenge - the caller must sign in again from the
 * password step. Below the cap, the challenge stays valid so a mistyped
 * code can be retried.
 *
 * Never logs the code, the encrypted secret, the decrypted secret, or the
 * encryption key - the decrypted secret exists only in the local `secret`
 * variable for the duration of the `authenticator.check` call below.
 */
export async function verifyOryCMSMfaLoginCode(
  challengeToken: string,
  code: string,
  pool: Pool = getOryCMSPool(),
): Promise<{ userId: string }> {
  const token = await peekOryCMSToken("mfa_login", challengeToken, pool);
  if (!token.userId) {
    throw new OryCMSAuthError(
      "INVALID_CREDENTIALS",
      "This login challenge is invalid or has expired.",
      400,
    );
  }

  const creds = await getOryCMSMfaCredentials(token.userId, pool);
  if (!creds?.mfaEnabled || !creds.mfaSecret || !creds.mfaSecretIv) {
    // Account state changed mid-challenge (e.g. MFA got disabled in another
    // tab) - fail closed. Never silently fall back to "no MFA required".
    throw new OryCMSAuthError(
      "INVALID_CREDENTIALS",
      "This login challenge is invalid or has expired.",
      400,
    );
  }

  const secret = decryptOryCMSMfaSecret(creds.mfaSecret, creds.mfaSecretIv);
  const valid = authenticator.check(code, secret);

  if (!valid) {
    const attempt = await incrementOryCMSTokenAttempts(
      "mfa_login",
      challengeToken,
      MFA_LOGIN_MAX_ATTEMPTS,
      pool,
    );
    if (!attempt) {
      throw new OryCMSAuthError(
        "INVALID_CREDENTIALS",
        "This login challenge is invalid or has expired.",
        400,
      );
    }
    if (attempt.locked) {
      throw Object.assign(
        new Error("Too many incorrect codes. Please sign in again."),
        { code: "MFA_CHALLENGE_LOCKED", statusCode: 429 },
      );
    }
    throw Object.assign(
      new Error("That code didn't match. Check your authenticator app and try again."),
      { code: "INVALID_MFA_CODE", statusCode: 422 },
    );
  }

  await consumeOryCMSToken("mfa_login", challengeToken, pool);
  return { userId: token.userId };
}

/**
 * Disable MFA: intentionally requires BOTH the current password AND a
 * current TOTP code - either alone is not enough. A stolen session cookie
 * plus a leaked password shouldn't be sufficient to strip MFA (that would
 * make MFA removable by exactly the kind of compromise it exists to guard
 * against); neither should a stolen session plus a glimpsed/shoulder-surfed
 * code without the password. `userId` must come from the caller's own
 * session (protectOryCMSAdminRoute) - never a client-supplied value.
 */

export interface OryCMSMfaDisableResult {
  disabled: true;
}

/**
 * Atomically clears MFA state - the mirror of activateOryCMSMfaForUser's
 * guard: `WHERE "mfaEnabled" = TRUE` instead of `= FALSE`. Concurrent
 * disable requests serialize on Postgres's row lock, so only one of them
 * performs the actual write; a disable racing a fresh re-enrollment (which
 * guards on the opposite state) can't interleave into partial or stale
 * credentials - whichever transition commits first is the one that sticks,
 * and the loser's guard simply stops matching afterward.
 */
async function disableOryCMSMfaForUser(userId: string, pool: Pool): Promise<void> {
  await pool.query(
    `UPDATE orycms_users
     SET "mfaEnabled" = FALSE, "mfaSecret" = NULL, "mfaSecretIv" = NULL, "mfaEnabledAt" = NULL
     WHERE id = $1 AND "mfaEnabled" = TRUE
     RETURNING id`,
    [userId],
  );
}

/**
 * Verifies password + current TOTP code for `userId` and, only if both
 * pass, clears MFA on the account. Does NOT touch sessions or write an
 * audit log - those are the caller's (the route's) responsibility, reusing
 * destroyOryCMSUserSessions and recordOryCMSAuditLog exactly as the rest of
 * this codebase already does for other security-sensitive actions.
 *
 * Order (fails closed at every step, never mutates the row until all
 * checks pass):
 *   1. Password check (verifyOryCMSUserPassword, userId-scoped, no hooks).
 *   2. Confirm MFA is actually enabled and has complete encrypted
 *      credentials - if not, there is nothing to disable.
 *   3. Decrypt the secret and check the submitted TOTP code.
 *   4. Atomic UPDATE (see disableOryCMSMfaForUser).
 *
 * Treats "already disabled" as a safe, idempotent success: by the time this
 * function reaches step 4 it has already confirmed (moments earlier) that
 * MFA was enabled and the password + code were correct, so if a concurrent
 * request disabled it first, the account is still left in the caller's
 * intended end state (MFA off) - there's nothing unsafe about not being the
 * request that flipped the bit.
 *
 * The decrypted secret exists only in the local `secret` variable for the
 * duration of the `authenticator.check` call below - never returned, never
 * logged, never stored anywhere else.
 */
export async function disableOryCMSMfa(
  userId: string,
  password: string,
  code: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMfaDisableResult> {
  const passwordValid = await verifyOryCMSUserPassword(pool, userId, password);
  if (!passwordValid) {
    throw new OryCMSAuthError("INVALID_CREDENTIALS", "Incorrect password.", 401);
  }

  const creds = await getOryCMSMfaCredentials(userId, pool);
  if (!creds?.mfaEnabled || !creds.mfaSecret || !creds.mfaSecretIv) {
    throw Object.assign(new Error("MFA is not enabled on this account."), {
      code: "MFA_NOT_ENABLED",
      statusCode: 409,
    });
  }

  const secret = decryptOryCMSMfaSecret(creds.mfaSecret, creds.mfaSecretIv);
  if (!authenticator.check(code, secret)) {
    throw Object.assign(
      new Error("That code didn't match. Check your authenticator app and try again."),
      { code: "INVALID_MFA_CODE", statusCode: 422 },
    );
  }

  await disableOryCMSMfaForUser(userId, pool);
  return { disabled: true };
}
