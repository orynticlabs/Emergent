import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRazorpayWebhookSignature, recordOryCMSPayment, updateOryCMSPaymentLinkStatus } from "@/payments";

// POST /api/orycms/webhooks/razorpay - public (Razorpay's servers call this
// directly, with no OryCMS session; must stay in middleware.ts's public
// allowlist). Identity/trust comes ENTIRELY from the HMAC-SHA256 signature
// in X-Razorpay-Signature, verified against the RAW request body - never
// from a session cookie, which Razorpay can't send anyway.
//
// Every branch below returns quickly (2xx unless the signature is invalid):
// Razorpay retries on non-2xx, and we don't want retries for event types we
// simply don't model yet - only a bad signature is treated as a real
// rejection.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    // Deliberately generic - never reveal whether it's a config, secret, or
    // signature mismatch problem to the caller.
    return NextResponse.json(
      { success: false, error: { code: "INVALID_SIGNATURE", message: "Invalid signature." } },
      { status: 400 },
    );
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      payment_link?: { entity?: Record<string, unknown> };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_PAYLOAD", message: "Malformed JSON." } },
      { status: 400 },
    );
  }

  try {
    const payment = event.payload?.payment?.entity;
    const paymentLink = event.payload?.payment_link?.entity;

    // Only events that carry an actual payment are logged - link-only
    // status events (e.g. an expiry with no payment attempt) have nothing
    // to put in the "payment received" log.
    if (payment && typeof payment.id === "string") {
      await recordOryCMSPayment({
        razorpayPaymentId: payment.id,
        razorpayOrderId: typeof payment.order_id === "string" ? payment.order_id : null,
        razorpayLinkId:
          typeof paymentLink?.id === "string"
            ? paymentLink.id
            : typeof payment.invoice_id === "string"
              ? payment.invoice_id
              : null,
        amount: typeof payment.amount === "number" ? payment.amount : 0,
        currency: typeof payment.currency === "string" ? payment.currency : "INR",
        status: typeof payment.status === "string" ? payment.status : "unknown",
        method: typeof payment.method === "string" ? payment.method : null,
        email: typeof payment.email === "string" ? payment.email : null,
        contact: typeof payment.contact === "string" ? payment.contact : null,
        eventType: event.event ?? "unknown",
        rawPayload: event,
      });
    }

    if (paymentLink && typeof paymentLink.id === "string" && typeof paymentLink.status === "string") {
      await updateOryCMSPaymentLinkStatus(paymentLink.id, paymentLink.status);
    }

    return NextResponse.json({ success: true, data: { received: true } });
  } catch {
    // A DB hiccup here SHOULD be retried by Razorpay - 500 is correct.
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process webhook." } },
      { status: 500 },
    );
  }
}
