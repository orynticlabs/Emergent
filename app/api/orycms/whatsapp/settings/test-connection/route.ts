import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppService } from "@/whatsapp";

// POST /api/orycms/whatsapp/settings/test-connection - backs the settings
// UI's "Test Connection" button. Delegates to OryCMSWhatsAppService.testConnection,
// which is a placeholder (checks required fields are present; makes no
// provider API call) - see whatsapp.repo.ts's testOryCMSWhatsAppConnection.
export async function POST(request: NextRequest) {
  try {
    await guardOryCMS(request, "whatsapp", "manage");
    const result = await OryCMSWhatsAppService.testConnection();
    return oryJsonOk(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
