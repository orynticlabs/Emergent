import crypto from "crypto";

/**
 * Webhook-specific security helpers for the WhatsApp module - signature
 * verification and constant-time token comparison. Kept separate from
 * whatsapp.crypto.ts (which is about encrypting/decrypting settings at
 * rest) since this is about verifying inbound HTTP requests, a different
 * concern with a different (non-secret) input shape.
 */

/** Constant-time string comparison - used for the GET verification challenge's `hub.verify_token`, mirroring the timing-safe comparison auth/mfa and payments/razorpay.client.ts already use for other secret-ish comparisons. Different-length inputs are treated as unequal without ever calling timingSafeEqual (which throws on length mismatch), and without leaking length via early-return timing since callers only care about the boolean. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Verifies Meta's `X-Hub-Signature-256` header (`sha256=<hex>`) against the
 * RAW request body bytes - must be the exact bytes Meta signed, never a
 * re-serialized/parsed-then-stringified copy (same requirement
 * payments/razorpay.client.ts documents for its own webhook signature).
 * Fails closed: any missing input or mismatch returns false, never throws
 * - a malformed signature header must not be able to crash the webhook
 * route into a 500 (which Meta would retry indefinitely).
 */
export function verifyOryCMSMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader) return false;

  const prefix = "sha256=";
  if (!signatureHeader.startsWith(prefix)) return false;
  const providedHex = signatureHeader.slice(prefix.length);

  const expectedHex = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  const expectedBuf = Buffer.from(expectedHex, "hex");
  const providedBuf = Buffer.from(providedHex, "hex");
  if (expectedBuf.length !== providedBuf.length || expectedBuf.length === 0) return false;

  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
