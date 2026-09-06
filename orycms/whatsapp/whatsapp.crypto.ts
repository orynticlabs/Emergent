import crypto from "crypto";

/**
 * At-rest encryption for WhatsApp secrets — accessToken, appSecret, and
 * verifyToken all go through this — AES-256-GCM via Node's built-in crypto
 * (no new dependency), mirroring auth/mfa.crypto.ts. Key comes from
 * ORYCMS_WHATSAPP_ENCRYPTION_KEY, a base64-encoded 32-byte value that must
 * live outside Postgres (env var only, never hard-coded, never sent to the
 * client). Generate one with:
 *
 *   openssl rand -base64 32
 *
 * Deliberately a separate key from ORYCMS_MFA_ENCRYPTION_KEY — a leaked
 * WhatsApp secret shouldn't compromise MFA secrets or vice versa.
 *
 * Unlike mfa.crypto.ts (which stores ciphertext and IV in two columns
 * because two columns already existed on orycms_users), each secret column
 * here is single, so the IV and GCM auth tag are packed into one blob per
 * field: base64(iv[12] || ciphertext || authTag[16]).
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // Standard/recommended GCM nonce size.
const AUTH_TAG_BYTES = 16;
const KEY_BYTES = 32; // AES-256

let cachedKey: Buffer | undefined;

/**
 * Reads and validates ORYCMS_WHATSAPP_ENCRYPTION_KEY on first use (not at
 * module load, so importing this file never crashes an unrelated request —
 * only actually encrypting/decrypting a token does). Throws an error shaped
 * like route-guards.ts's toErrorResponse expects ({code, statusCode}), so a
 * future route maps it to a clean response without leaking why to the client.
 */
function getOryCMSWhatsAppEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ORYCMS_WHATSAPP_ENCRYPTION_KEY;
  if (!raw) {
    throw Object.assign(
      new Error(
        "ORYCMS_WHATSAPP_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` " +
          "and set it in the environment before WhatsApp settings can store an access token.",
      ),
      { code: "WHATSAPP_ENCRYPTION_UNAVAILABLE", statusCode: 500 },
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw Object.assign(
      new Error(
        `ORYCMS_WHATSAPP_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes for AES-256. ` +
          "Generate one with `openssl rand -base64 32`.",
      ),
      { code: "WHATSAPP_ENCRYPTION_UNAVAILABLE", statusCode: 500 },
    );
  }

  cachedKey = key;
  return key;
}

/** Encrypts a WhatsApp secret (access token, app secret, or verify token) for storage. Never logs the plaintext or the key. */
export function encryptOryCMSWhatsAppSecret(secret: string): string {
  const key = getOryCMSWhatsAppEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, authTag]).toString("base64");
}

/** Decrypts a WhatsApp secret previously produced by encryptOryCMSWhatsAppSecret. Never logs the plaintext or the key. */
export function decryptOryCMSWhatsAppSecret(blob: string): string {
  const key = getOryCMSWhatsAppEncryptionKey();
  const data = Buffer.from(blob, "base64");

  const iv = data.subarray(0, IV_BYTES);
  const authTag = data.subarray(data.length - AUTH_TAG_BYTES);
  const ciphertext = data.subarray(IV_BYTES, data.length - AUTH_TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
