import crypto from "crypto";

/**
 * At-rest encryption for TOTP secrets — AES-256-GCM via Node's built-in
 * crypto (no new dependency). Key comes from ORYCMS_MFA_ENCRYPTION_KEY, a
 * base64-encoded 32-byte value that must live outside Postgres (env var
 * only, never hard-coded, never sent to the client). Generate one with:
 *
 *   openssl rand -base64 32
 *
 * GCM's auth tag is appended to the ciphertext before base64-encoding, so
 * "mfaSecret" holds ciphertext+tag and "mfaSecretIv" holds only the IV —
 * matching the two columns mfa.schema.ts already added to orycms_users.
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // Standard/recommended GCM nonce size.
const AUTH_TAG_BYTES = 16;
const KEY_BYTES = 32; // AES-256

let cachedKey: Buffer | undefined;

/**
 * Reads and validates ORYCMS_MFA_ENCRYPTION_KEY on first use (not at module
 * load, so importing this file never crashes an unrelated request — only
 * actually encrypting/decrypting an MFA secret does). Throws a
 * StatusfulError-shaped error so route handlers' toErrorResponse maps it to
 * a clean 500 without leaking why to the client; the message itself never
 * contains the key.
 */
function getOryCMSMfaEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ORYCMS_MFA_ENCRYPTION_KEY;
  if (!raw) {
    throw Object.assign(
      new Error(
        "ORYCMS_MFA_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` " +
          "and set it in the environment before MFA can be enabled.",
      ),
      { code: "MFA_ENCRYPTION_UNAVAILABLE", statusCode: 500 },
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw Object.assign(
      new Error(
        `ORYCMS_MFA_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes for AES-256. ` +
          "Generate one with `openssl rand -base64 32`.",
      ),
      { code: "MFA_ENCRYPTION_UNAVAILABLE", statusCode: 500 },
    );
  }

  cachedKey = key;
  return key;
}

export interface OryCMSEncryptedMfaSecret {
  /** Base64 ciphertext with the GCM auth tag appended. Goes in "mfaSecret". */
  encrypted: string;
  /** Base64 IV. Goes in "mfaSecretIv". */
  iv: string;
}

/** Encrypts a TOTP secret for storage. Never logs the plaintext or the key. */
export function encryptOryCMSMfaSecret(secret: string): OryCMSEncryptedMfaSecret {
  const key = getOryCMSMfaEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: Buffer.concat([ciphertext, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

/**
 * Decrypts a TOTP secret previously produced by encryptOryCMSMfaSecret.
 * Not called anywhere yet (no login-time MFA challenge exists in this step) —
 * provided so the encryption scheme is verifiably reversible and ready for
 * that later step. Never logs the plaintext or the key.
 */
export function decryptOryCMSMfaSecret(encrypted: string, iv: string): string {
  const key = getOryCMSMfaEncryptionKey();
  const data = Buffer.from(encrypted, "base64");
  const ciphertext = data.subarray(0, data.length - AUTH_TAG_BYTES);
  const authTag = data.subarray(data.length - AUTH_TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
