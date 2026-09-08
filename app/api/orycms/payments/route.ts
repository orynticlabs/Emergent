import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSPayments } from "@/payments";
import { isOryCMSRazorpayConfigured, isOryCMSRazorpayWebhookConfigured } from "@/payments";

// GET /api/orycms/payments - payment-received log, populated entirely from
// verified Razorpay webhook events (see /api/orycms/webhooks/razorpay).
// Also reports whether Razorpay is configured, for the Settings-style status
// card - never the credential values themselves. Gated by "payments" (Super
// Admin/Admin by default).
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "payments", "read");
    const payments = await listOryCMSPayments();
    return oryJsonOk({
      payments,
      configured: isOryCMSRazorpayConfigured(),
      webhookConfigured: isOryCMSRazorpayWebhookConfigured(),
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
