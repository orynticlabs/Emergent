import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppService } from "@/whatsapp";
import { recordOryCMSAuditLog } from "@/audit";

/**
 * Admin-only test endpoint for verifying outbound WhatsApp connectivity -
 * sends one real text message via OryCMSWhatsAppService.sendTextMessage(),
 * exactly like a future automation layer would, just triggered manually
 * instead of by an inbound event. Not a general-purpose "send message" API
 * for building a messaging feature on top of - see this step's scope
 * (Conversations/inbox, automation, etc. are explicitly not built yet).
 */
interface OryCMSWhatsAppSendTestBody {
  to?: string;
  message?: string;
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

// POST /api/orycms/whatsapp/send-test-message - requires an explicit
// recipient + message; there is no default/implicit test recipient. Gated
// on "whatsapp":"manage" (the same permission that gates WhatsApp settings
// mutations). Never returns or logs the access token; audit metadata is
// booleans/provider/messageId/errorCode only - never the recipient number
// or the message text itself.
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");

    let body: OryCMSWhatsAppSendTestBody;
    try {
      body = (await request.json()) as OryCMSWhatsAppSendTestBody;
    } catch {
      throw validationError("Request body must be valid JSON.");
    }

    if (!body.to || !body.to.trim()) {
      throw validationError("to (recipient phone number / WhatsApp id) is required.");
    }
    if (!body.message || !body.message.trim()) {
      throw validationError("message is required.");
    }

    const result = await OryCMSWhatsAppService.sendTextMessage(body.to, body.message);

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "send_test_message",
      resource: "whatsapp",
      resourceId: result.provider,
      metadata: {
        success: result.success,
        provider: result.provider,
        messageSent: result.success,
        ...(result.success ? {} : { errorCode: result.error.code }),
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
