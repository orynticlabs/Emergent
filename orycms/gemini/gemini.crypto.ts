import crypto from "crypto";

/**
 * At-rest encryption for the Gemini API key - AES-256-GCM via Node's
 * built-in crypto (no new dependency), mirroring auth/mfa.crypto.ts and
 * whatsapp/whatsapp.crypto.ts. Key comes from ORYCMS_GEMINI_ENCRYPTION_KEY,
 * a base64-encoded 32-byte value that must live outside Postgres (env var
 * only, never hard-coded, never sent to the client). Generate one with:
 *
 *   openssl rand -base64 32
 *
 * Deliberately its own key, separate from ORYCMS_MFA_ENCRYPTION_KEY and
 * ORYCMS_WHATSAPP_ENCRYPTION_KEY - a leaked Gemini key shouldn't compromise
 * MFA secrets or WhatsApp credentials, or vice versa. This is also what
 * keeps the Gemini plugin independent: nothing about its key material is
 * shared with any other module.
 *
 * IV and GCM auth tag are packed into one blob alongside the ciphertext,
 * matching whatsapp.crypto.ts's single-column format:
 * base64(iv[12] || ciphertext || authTag[16]).
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // Standard/recommended GCM nonce size.
const AUTH_TAG_BYTES = 16;
const KEY_BYTES = 32; // AES-256

let cachedKey: Buffer | undefined;

/**
 * Reads and validates ORYCMS_GEMINI_ENCRYPTION_KEY on first use (not at
 * module load, so importing this file never crashes an unrelated request -
 * only actually encrypting/decrypting the API key does). Throws an error
 * shaped like route-guards.ts's toErrorResponse expects ({code, statusCode}),
 * so the route maps it to a clean response without leaking why to the client.
 */
function getOryCMSGeminiEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ORYCMS_GEMINI_ENCRYPTION_KEY;
  if (!raw) {
    throw Object.assign(
      new Error(
        "ORYCMS_GEMINI_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` " +
          "and set it in the environment before Gemini settings can store an API key.",
      ),
      { code: "GEMINI_ENCRYPTION_UNAVAILABLE", statusCode: 500 },
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw Object.assign(
      new Error(
        `ORYCMS_GEMINI_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes for AES-256. ` +
          "Generate one with `openssl rand -base64 32`.",
      ),
      { code: "GEMINI_ENCRYPTION_UNAVAILABLE", statusCode: 500 },
    );
  }

  cachedKey = key;
  return key;
}

/** Encrypts the Gemini API key for storage. Never logs the plaintext or the key. */
export function encryptOryCMSGeminiApiKey(apiKey: string): string {
  const key = getOryCMSGeminiEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, authTag]).toString("base64");
}

/** Decrypts a Gemini API key previously produced by encryptOryCMSGeminiApiKey. Never logs the plaintext or the key. */
export function decryptOryCMSGeminiApiKey(blob: string): string {
  const key = getOryCMSGeminiEncryptionKey();
  const data = Buffer.from(blob, "base64");

  const iv = data.subarray(0, IV_BYTES);
  const authTag = data.subarray(data.length - AUTH_TAG_BYTES);
  const ciphertext = data.subarray(IV_BYTES, data.length - AUTH_TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
