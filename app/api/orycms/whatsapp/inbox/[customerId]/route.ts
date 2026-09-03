import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppInboxService } from "@/whatsapp";

type RouteCtx = { params: Promise<{ customerId: string }> };

// GET /api/orycms/whatsapp/inbox/:customerId — full message timeline for
// one customer plus current menu-flow "awaiting selection" state. Gated
// on "whatsapp":"manage".
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "whatsapp", "manage");
    const { customerId } = await params;
    const conversation = await OryCMSWhatsAppInboxService.getConversation(
      decodeURIComponent(customerId),
    );
    return oryJsonOk({ conversation });
  } catch (err) {
    return toErrorResponse(err);
  }
}
