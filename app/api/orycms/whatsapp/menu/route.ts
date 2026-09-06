import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { OryCMSWhatsAppMenuService } from "@/whatsapp";
import { recordOryCMSAuditLog } from "@/audit";

/**
 * WhatsApp menu configuration — Step 10. Configuration only: nothing here
 * is wired to the webhook, routing, or AI replies (see
 * whatsapp.menu.service.ts's header comment). Both methods are gated on
 * "whatsapp":"manage" per the task's explicit instruction, matching how
 * Step 2's WhatsApp settings routes are gated.
 */

interface OryCMSWhatsAppMenuOptionBody {
  number?: number;
  title?: string;
  aiInstructions?: string | null;
}

interface OryCMSWhatsAppMenuBody {
  enabled?: boolean;
  welcomeMessage?: string | null;
  options?: OryCMSWhatsAppMenuOptionBody[];
}

function validationError(message: string) {
  return Object.assign(new Error(message), { code: "VALIDATION_ERROR", statusCode: 422 });
}

async function parseBody(request: NextRequest): Promise<OryCMSWhatsAppMenuBody> {
  try {
    return (await request.json()) as OryCMSWhatsAppMenuBody;
  } catch {
    throw validationError("Request body must be valid JSON.");
  }
}

// GET /api/orycms/whatsapp/menu — full menu configuration (enabled,
// welcomeMessage, options). Nothing here is a secret, so unlike the
// WhatsApp/Gemini settings routes there's no masked/safe projection —
// this is the raw configuration as saved.
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "whatsapp", "manage");
    const menu = await OryCMSWhatsAppMenuService.getMenu();
    return oryJsonOk({ menu });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/whatsapp/menu — update provided fields only.
// `options`, when present, REPLACES the entire option list — this is how
// the admin UI expresses adding, editing, and deleting options through a
// single call (see whatsapp.menu.repo.ts's replaceOryCMSWhatsAppMenuOptions).
export async function PATCH(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "whatsapp", "manage");
    const body = await parseBody(request);

    const patch: Parameters<typeof OryCMSWhatsAppMenuService.updateMenu>[0] = {
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      ...(body.welcomeMessage !== undefined && { welcomeMessage: body.welcomeMessage }),
      ...(body.options !== undefined && {
        options: body.options.map((option) => ({
          number: option.number as number,
          title: option.title as string,
          aiInstructions: option.aiInstructions ?? null,
        })),
      }),
    };

    if (Object.keys(patch).length === 0) {
      throw validationError("No fields provided to update.");
    }

    const menu = await OryCMSWhatsAppMenuService.updateMenu(patch);

    // Metadata is counts/booleans only — option titles/instructions are
    // admin-authored config, not customer data, but kept out of the audit
    // log anyway to stay consistent with this feature line's "don't log
    // configuration content" convention (Gemini's systemInstruction/
    // businessContext are handled the same way).
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "whatsapp",
      resourceId: "menu",
      metadata: {
        fieldsUpdated: Object.keys(patch),
        enabled: menu.enabled,
        optionCount: menu.options.length,
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ menu });
  } catch (err) {
    return toErrorResponse(err);
  }
}
