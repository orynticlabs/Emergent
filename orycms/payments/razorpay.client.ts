import crypto from "crypto";

/**
 * Thin wrapper over Razorpay's REST API — plain `fetch`, no SDK dependency
 * (mirrors how the rest of this codebase prefers Node built-ins / direct
 * HTTP calls over adding a client library for a single integration).
 *
 * Credentials are read lazily (only when actually calling out or verifying
 * a webhook), never at module load, so an unset env var doesn't crash an
 * unrelated request — same pattern as orycms/auth/mfa.crypto.ts.
 */

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

function getOryCMSRazorpayCredentials(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw Object.assign(
      new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."),
      { code: "RAZORPAY_NOT_CONFIGURED", statusCode: 409 },
    );
  }
  return { keyId, keySecret };
}

/** True when both API credentials are present — for the Settings/status UI, never logs the values themselves. */
export function isOryCMSRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** True when the webhook secret is set — signature verification fails closed otherwise. */
export function isOryCMSRazorpayWebhookConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
}

export interface OryCMSCreatePaymentLinkInput {
  /** Amount in the smallest currency unit (paise for INR — ₹500 = 50000). */
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
}

export interface OryCMSRazorpayPaymentLink {
  id: string;
  short_url: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * Creates a Razorpay Payment Link via the REST API. Throws a
 * {code, statusCode}-shaped error (matching this codebase's toErrorResponse
 * convention) on missing config or a non-2xx response — never logs the key
 * secret, and the secret only ever appears in the outgoing Authorization
 * header, never in a thrown error message.
 */
export async function createRazorpayPaymentLink(
  input: OryCMSCreatePaymentLinkInput,
): Promise<OryCMSRazorpayPaymentLink> {
  const { keyId, keySecret } = getOryCMSRazorpayCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch(`${RAZORPAY_API_BASE}/payment_links`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? "INR",
      description: input.description || undefined,
      customer:
        input.customerName || input.customerEmail || input.customerContact
          ? {
              name: input.customerName || undefined,
              email: input.customerEmail || undefined,
              contact: input.customerContact || undefined,
            }
          : undefined,
      notify: { sms: Boolean(input.customerContact), email: Boolean(input.customerEmail) },
    }),
  });

  const body = (await res.json().catch(() => null)) as
    | (OryCMSRazorpayPaymentLink & { error?: { description?: string } })
    | null;

  if (!res.ok || !body) {
    throw Object.assign(
      new Error(body?.error?.description || "Razorpay rejected the payment link request."),
      { code: "RAZORPAY_REQUEST_FAILED", statusCode: 502 },
    );
  }

  return body;
}

/**
 * Verifies the `X-Razorpay-Signature` header against the RAW request body
 * (must be the exact bytes Razorpay signed — parse JSON only AFTER this
 * passes, never re-serialize and check against that). Constant-time
 * comparison via crypto.timingSafeEqual. Fails closed: returns false on any
 * missing config, missing signature, or mismatch — never throws, so a
 * malformed request can't crash the webhook route into a 500 (which
 * Razorpay would interpret as "retry me").
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");

  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
