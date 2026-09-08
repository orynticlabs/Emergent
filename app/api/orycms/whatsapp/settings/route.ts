import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppService, isOryCMSWhatsAppProvider } from "@/whatsapp";
import type { OryCMSWhatsAppProvider } from "@/whatsapp";
import { recordOryCMSAuditLog } from "@/audit";

// Fields the WhatsApp settings API accepts. "enabled", "displayName", and
// "webhookEnabled" (Step 1 columns) are deliberately not exposed here -
// this step's UI only surfaces connection identity + secrets + status.
interface OryCMSWhatsAppSettingsBody {
  provider?: string;
  phoneNumberId?: string | null;
  businessAccountId?: string | null;
  appId?: string | null;
  appSecret?: string | null;
  accessToken?: string | null;
  verifyToken?: string | null;
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

/** True for undefined, null, or a whitespace-only string - the "nothing meaningful was sent" case for a plain text field. */
function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

async function parseBody(request: NextRequest): Promise<OryCMSWhatsAppSettingsBody> {
  try {
    return (await request.json()) as OryCMSWhatsAppSettingsBody;
  } catch {
    throw validationError("Request body must be valid JSON.");
  }
}

// GET /api/orycms/whatsapp/settings - provider + configuration status only.
// Never returns accessToken, appSecret, or verifyToken (OryCMSWhatsAppService
// strips them before this handler ever sees the result).
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "whatsapp", "manage");
    const settings = await OryCMSWhatsAppService.getSettings();
    return oryJsonOk({ settings });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/whatsapp/settings - save (create or fully replace) the
// WhatsApp configuration. Secrets are encrypted inside OryCMSWhatsAppService
// before they ever reach the database; this handler never logs them.
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");
    const body = await parseBody(request);

    if (!body.provider || !isOryCMSWhatsAppProvider(body.provider)) {
      throw validationError(
        "provider is required and must be one of: meta, twilio, 360dialog, gupshup, interakt.",
      );
    }

    const settings = await OryCMSWhatsAppService.saveSettings({
      provider: body.provider as OryCMSWhatsAppProvider,
      phoneNumberId: body.phoneNumberId ?? null,
      businessAccountId: body.businessAccountId ?? null,
      appId: body.appId ?? null,
      appSecret: body.appSecret ?? null,
      accessToken: body.accessToken ?? null,
      verifyToken: body.verifyToken ?? null,
    });

    // Metadata is booleans only - never the secret values themselves.
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "connect",
      resource: "whatsapp",
      resourceId: body.provider,
      metadata: {
        provider: body.provider,
        accessTokenProvided: !isBlank(body.accessToken),
        appSecretProvided: !isBlank(body.appSecret),
        verifyTokenProvided: !isBlank(body.verifyToken),
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ settings }, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/whatsapp/settings - update provided fields only.
// Secret fields (accessToken, appSecret, verifyToken) are only touched when
// a genuinely non-blank value is sent; omitted or blank secret fields leave
// the existing encrypted value untouched.
export async function PATCH(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");
    const body = await parseBody(request);

    if (body.provider !== undefined && !isOryCMSWhatsAppProvider(body.provider)) {
      throw validationError(
        "provider must be one of: meta, twilio, 360dialog, gupshup, interakt.",
      );
    }

    const patch: Parameters<typeof OryCMSWhatsAppService.updateSettings>[0] = {
      ...(body.provider !== undefined && { provider: body.provider as OryCMSWhatsAppProvider }),
      ...(!isBlank(body.phoneNumberId) && { phoneNumberId: body.phoneNumberId }),
      ...(!isBlank(body.businessAccountId) && { businessAccountId: body.businessAccountId }),
      ...(!isBlank(body.appId) && { appId: body.appId }),
      // Secrets: only ever included when non-blank - this is what protects
      // an already-stored secret from being wiped by a blank/omitted field.
      ...(!isBlank(body.accessToken) && { accessToken: body.accessToken }),
      ...(!isBlank(body.appSecret) && { appSecret: body.appSecret }),
      ...(!isBlank(body.verifyToken) && { verifyToken: body.verifyToken }),
    };

    if (Object.keys(patch).length === 0) {
      throw validationError("No fields provided to update.");
    }

    const settings = await OryCMSWhatsAppService.updateSettings(patch);

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "whatsapp",
      resourceId: settings.provider,
      metadata: {
        fieldsUpdated: Object.keys(patch),
        accessTokenChanged: patch.accessToken !== undefined,
        appSecretChanged: patch.appSecret !== undefined,
        verifyTokenChanged: patch.verifyToken !== undefined,
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ settings });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/whatsapp/settings - disconnect WhatsApp (removes the
// configuration row entirely, including the encrypted secrets).
export async function DELETE(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");
    await OryCMSWhatsAppService.deleteSettings();

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "disconnect",
      resource: "whatsapp",
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
