import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSAIService } from "@/ai";
import { recordOryCMSAuditLog } from "@/audit";

// Internal/test endpoint for the generic AI provider layer — exists to
// verify orycms/ai -> orycms/ai/providers/gemini.provider.ts ->
// orycms/gemini works end-to-end, independent of any UI. Not meant to be
// the long-term public surface for AI generation; a later step can replace
// or wrap this with whatever a real feature (none exist yet) needs.
interface OryCMSAIGenerateBody {
  systemInstruction?: string | null;
  userMessage?: string;
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

// POST /api/orycms/ai/generate — protected by "ai":"manage" (the same
// permission that gates Gemini settings mutations and Test Connection —
// generation is at least as sensitive an action). Returns only the
// normalized OryCMSAIGenerateResult: never the API key, and never anything
// beyond what OryCMSAIService.generate() itself returns. Audit metadata is
// booleans/provider/model/usage counts only — the request body
// (systemInstruction, userMessage) and the generated text are never logged.
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "ai", "manage");

    let body: OryCMSAIGenerateBody;
    try {
      body = (await request.json()) as OryCMSAIGenerateBody;
    } catch {
      throw validationError("Request body must be valid JSON.");
    }

    if (!body.userMessage || !body.userMessage.trim()) {
      throw validationError("userMessage is required.");
    }

    const result = await OryCMSAIService.generate({
      systemInstruction: body.systemInstruction ?? null,
      userMessage: body.userMessage,
    });

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "generate",
      resource: "ai",
      resourceId: result.provider,
      metadata: {
        success: result.success,
        provider: result.provider,
        model: result.model,
        ...(result.success
          ? { usage: result.usage }
          : { errorCode: result.error.code }),
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
