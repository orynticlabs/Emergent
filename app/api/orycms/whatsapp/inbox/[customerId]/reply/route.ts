import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppInboxService } from "@/whatsapp";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ customerId: string }> };

interface OryCMSWhatsAppInboxReplyBody {
  text?: string;
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

/**
 * POST /api/orycms/whatsapp/inbox/:customerId/reply - manual admin reply.
 * Sends through OryCMSWhatsAppInboxService.sendManualReply(), which itself
 * only calls the existing OryCMSWhatsAppService.sendTextMessage() (no new
 * provider, no duplicated send logic). Gated on "whatsapp":"manage" -
 * same permission every other WhatsApp mutation in this codebase requires;
 * a manual reply is not a special/bypass path around RBAC.
 */
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");
    const { customerId } = await params;
    const decodedCustomerId = decodeURIComponent(customerId);

    let body: OryCMSWhatsAppInboxReplyBody;
    try {
      body = (await request.json()) as OryCMSWhatsAppInboxReplyBody;
    } catch {
      throw validationError("Request body must be valid JSON.");
    }

    if (!body.text || !body.text.trim()) {
      throw validationError("text is required.");
    }

    const result = await OryCMSWhatsAppInboxService.sendManualReply(decodedCustomerId, body.text);

    // Metadata is booleans/provider/errorCode only - never the message text.
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "send_manual_reply",
      resource: "whatsapp",
      resourceId: decodedCustomerId,
      metadata: {
        success: result.success,
        provider: result.provider,
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
