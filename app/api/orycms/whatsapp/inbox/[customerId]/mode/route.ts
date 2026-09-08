import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppInboxService, isOryCMSWhatsAppConversationMode } from "@/whatsapp";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ customerId: string }> };

interface OryCMSWhatsAppSetModeBody {
  mode?: string;
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

/**
 * PATCH /api/orycms/whatsapp/inbox/:customerId/mode - "Take Over" (mode:
 * "human") / "Resume AI" (mode: "ai") in the inbox. Only flips the stored
 * mode flag whatsapp.ai-automation.service.ts checks before generating or
 * sending anything - no send or AI logic lives here. Gated on
 * "whatsapp":"manage", same as every other WhatsApp mutation; a manual
 * takeover is not a special/bypass path around RBAC.
 */
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");
    const { customerId } = await params;
    const decodedCustomerId = decodeURIComponent(customerId);

    let body: OryCMSWhatsAppSetModeBody;
    try {
      body = (await request.json()) as OryCMSWhatsAppSetModeBody;
    } catch {
      throw validationError("Request body must be valid JSON.");
    }

    if (!isOryCMSWhatsAppConversationMode(body.mode)) {
      throw validationError('mode must be "ai" or "human".');
    }

    await OryCMSWhatsAppInboxService.setConversationMode(
      decodedCustomerId,
      body.mode,
      session.userId,
    );

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: body.mode === "human" ? "take_over" : "resume_ai",
      resource: "whatsapp",
      resourceId: decodedCustomerId,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ customerId: decodedCustomerId, mode: body.mode });
  } catch (err) {
    return toErrorResponse(err);
  }
}
