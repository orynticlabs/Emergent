import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSGeminiService } from "@/gemini";
import { recordOryCMSAuditLog } from "@/audit";

// POST /api/orycms/gemini/settings/test-connection — backs the settings
// UI's "Test Connection" button. Unlike whatsapp's placeholder equivalent,
// this makes a real (lightweight, metadata-only) call to the Gemini API to
// confirm the configured key + model actually work — see
// gemini.client.ts's testOryCMSGeminiConnection. Gated on "ai":"manage"
// (not "read") since it decrypts and uses the live key, a more sensitive
// action than viewing configuration status.
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "ai", "manage");
    const result = await OryCMSGeminiService.testConnection();

    // Metadata is the boolean/code outcome only — never the API key.
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "test_connection",
      resource: "ai",
      resourceId: "gemini",
      metadata: { ok: result.ok, code: result.code },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
