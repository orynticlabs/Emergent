import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  normalizeOryCMSWhatsAppWebhookPayload,
  OryCMSWhatsAppAIAutomationService,
  OryCMSWhatsAppService,
  timingSafeStringEqual,
  verifyOryCMSMetaWebhookSignature,
} from "@/whatsapp";
import type { OryCMSWhatsAppAutomationResult } from "@/whatsapp";

/**
 * WhatsApp webhook — receives events directly from the configured BSP
 * (Meta today). Deliberately NOT behind guardOryCMS/protectOryCMSAdminRoute:
 * WhatsApp has no OryCMS admin session and must be able to call this route
 * on its own. Authenticity is instead established per-request:
 *   - GET:  the `hub.verify_token` query param must match the configured,
 *           decrypted verifyToken (Meta's subscription-verification step).
 *   - POST: the `X-Hub-Signature-256` header must be a valid HMAC-SHA256 of
 *           the raw body using the configured, decrypted appSecret (Meta's
 *           per-request signature).
 * Neither the token nor the secret is ever read from an admin-session
 * value — both come from OryCMSWhatsAppService.getWebhookVerificationConfig(),
 * a method that exists specifically for this route and is documented as
 * never response-safe.
 *
 * Flow: Verify → Normalize → Dispatch → Acknowledge. This route holds NONE
 * of the "check config → AI generation → outbound reply" logic itself —
 * every normalized message is handed to
 * OryCMSWhatsAppAIAutomationService.handleInboundMessage() (Step 8), which
 * owns that entirely. Each call is wrapped so a single message's failure
 * (or an unexpected exception the service itself didn't already normalize)
 * can never prevent WhatsApp from getting its 200 ack, and never surfaces
 * an internal error message back to WhatsApp.
 */

// GET /api/orycms/whatsapp/webhook — Meta's subscription verification
// challenge. Must respond with the raw `hub.challenge` value (plain text,
// not JSON) when `hub.mode=subscribe` and `hub.verify_token` matches.
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const config = await OryCMSWhatsAppService.getWebhookVerificationConfig();
  if (!config?.verifyToken || !timingSafeStringEqual(token, config.verifyToken)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

// POST /api/orycms/whatsapp/webhook — incoming events. Always resolves
// quickly with a 2xx once the request is authenticated (or, if WhatsApp
// isn't configured at all, without attempting to authenticate anything —
// there's nothing to check against) so the BSP doesn't retry-storm this
// endpoint. Only a bad/missing signature on a configured integration is
// rejected outright.
export async function POST(request: NextRequest) {
  const config = await OryCMSWhatsAppService.getWebhookVerificationConfig();

  // Not configured yet: nothing to verify against and no provider context
  // to normalize with. Acknowledge without processing rather than 404 —
  // avoids the BSP retrying a request that will never succeed differently.
  if (!config) {
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }

  // Raw text first — signature verification needs the exact bytes Meta
  // signed, not a re-serialized copy. JSON.parse only happens after.
  const rawBody = await request.text();

  if (config.appSecret) {
    const signature = request.headers.get("x-hub-signature-256");
    if (!verifyOryCMSMetaWebhookSignature(rawBody, signature, config.appSecret)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }
  }
  // No appSecret configured: signature verification is skipped rather than
  // rejecting outright, since Step 2/3 never required appSecret to be set
  // to save WhatsApp settings — an admin can tighten this simply by
  // configuring an App Secret (see Security notes in this step's report).

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    // Not valid JSON at all — not a real Meta request. Reject outright
    // rather than pretending to acknowledge it.
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const result = normalizeOryCMSWhatsAppWebhookPayload(config.provider, parsedBody);

  // Dispatch every normalized message to the automation service. Never
  // logs payload content — only {messageId, status} labels ever leave
  // this function, and only in the response body, never a log line. A
  // per-message try/catch means one message throwing unexpectedly (the
  // service itself is designed to never throw, but this is the safety net
  // promised in this route's header comment) can't take down the rest of
  // the batch or the response WhatsApp gets.
  const results: OryCMSWhatsAppAutomationResult[] = [];
  for (const message of result.messages) {
    try {
      results.push(await OryCMSWhatsAppAIAutomationService.handleInboundMessage(message));
    } catch {
      results.push({ messageId: message.messageId, status: "failed_unexpected" });
    }
  }

  return NextResponse.json(
    { received: true, processed: !result.malformed, messageCount: result.messages.length, results },
    { status: 200 },
  );
}
