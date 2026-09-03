import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSGeminiService } from "@/gemini";
import { recordOryCMSAuditLog } from "@/audit";

// Fields the Gemini settings API accepts.
interface OryCMSGeminiSettingsBody {
  enabled?: boolean;
  apiKey?: string | null;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string | null;
  businessContext?: string | null;
  autoReplyEnabled?: boolean;
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

/** True for undefined, null, or a whitespace-only string — the "nothing meaningful was sent" case for the API key specifically (numbers/booleans use `!== undefined` instead, since 0/false are valid values). */
function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

async function parseBody(request: NextRequest): Promise<OryCMSGeminiSettingsBody> {
  try {
    return (await request.json()) as OryCMSGeminiSettingsBody;
  } catch {
    throw validationError("Request body must be valid JSON.");
  }
}

// GET /api/orycms/gemini/settings — configuration status only. Never
// returns the API key (OryCMSGeminiService strips it before this handler
// ever sees the result). Gated on "ai":"read" — Editor/Author already hold
// this by default (see rbac/rbac.engine.ts), matching how a read-only role
// can view but not change AI configuration.
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "ai", "read");
    const settings = await OryCMSGeminiService.getSettings();
    return oryJsonOk({ settings });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/gemini/settings — save (create or fully replace) the
// Gemini configuration. The API key is encrypted inside OryCMSGeminiService
// before it ever reaches the database; this handler never logs it.
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "ai", "manage");
    const body = await parseBody(request);

    const settings = await OryCMSGeminiService.saveSettings({
      enabled: body.enabled,
      apiKey: body.apiKey ?? null,
      model: body.model,
      temperature: body.temperature,
      maxOutputTokens: body.maxOutputTokens,
      systemInstruction: body.systemInstruction ?? null,
      businessContext: body.businessContext ?? null,
      autoReplyEnabled: body.autoReplyEnabled,
    });

    // Metadata is booleans/numbers about the shape of the request only —
    // never the API key, systemInstruction, or businessContext content
    // itself (those may hold business-sensitive pricing/policy language).
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "connect",
      resource: "ai",
      resourceId: "gemini",
      metadata: {
        provider: "gemini",
        apiKeyProvided: !isBlank(body.apiKey),
        model: settings.model,
        enabled: settings.enabled,
        systemInstructionProvided: Boolean(body.systemInstruction?.trim()),
        businessContextProvided: Boolean(body.businessContext?.trim()),
        autoReplyEnabled: settings.autoReplyEnabled,
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ settings }, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/gemini/settings — update provided fields only. apiKey
// is only touched when a genuinely non-blank value is sent; an omitted or
// blank apiKey leaves the existing encrypted value untouched (it's a
// secret — see whatsapp's Step 2 PATCH for the same rule). Numeric/boolean
// fields (temperature, maxOutputTokens, enabled, autoReplyEnabled) use
// "!== undefined" rather than a blank check, since 0 and false are valid
// values. systemInstruction/businessContext also use "!== undefined" (not
// a blank check) — unlike apiKey they aren't secrets, so an explicit empty
// string is a legitimate "clear this field" request, not something to
// silently ignore.
export async function PATCH(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "ai", "manage");
    const body = await parseBody(request);

    const patch: Parameters<typeof OryCMSGeminiService.updateSettings>[0] = {
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      ...(!isBlank(body.apiKey) && { apiKey: body.apiKey }),
      ...(body.model !== undefined && { model: body.model }),
      ...(body.temperature !== undefined && { temperature: body.temperature }),
      ...(body.maxOutputTokens !== undefined && { maxOutputTokens: body.maxOutputTokens }),
      ...(body.systemInstruction !== undefined && { systemInstruction: body.systemInstruction }),
      ...(body.businessContext !== undefined && { businessContext: body.businessContext }),
      ...(body.autoReplyEnabled !== undefined && { autoReplyEnabled: body.autoReplyEnabled }),
    };

    if (Object.keys(patch).length === 0) {
      throw validationError("No fields provided to update.");
    }

    const settings = await OryCMSGeminiService.updateSettings(patch);

    // Metadata is field names and booleans only — never the
    // systemInstruction/businessContext text itself.
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "ai",
      resourceId: "gemini",
      metadata: {
        fieldsUpdated: Object.keys(patch),
        apiKeyChanged: patch.apiKey !== undefined,
        systemInstructionChanged: patch.systemInstruction !== undefined,
        businessContextChanged: patch.businessContext !== undefined,
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ settings });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/gemini/settings — disconnect Gemini (removes the
// configuration row entirely, including the encrypted API key).
export async function DELETE(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "ai", "manage");
    await OryCMSGeminiService.deleteSettings();

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "disconnect",
      resource: "ai",
      resourceId: "gemini",
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
