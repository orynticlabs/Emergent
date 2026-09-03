import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppInboxService } from "@/whatsapp";

// GET /api/orycms/whatsapp/inbox — conversation list (grouped by customer,
// most recently active first). Gated on "whatsapp":"manage", matching
// every other WhatsApp admin route — an inbox exposes real customer
// message content, at least as sensitive as settings.
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "whatsapp", "manage");
    const conversations = await OryCMSWhatsAppInboxService.listConversations();
    return oryJsonOk({ conversations });
  } catch (err) {
    return toErrorResponse(err);
  }
}
