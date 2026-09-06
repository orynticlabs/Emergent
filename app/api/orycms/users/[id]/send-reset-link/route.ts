import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSUser } from "@/users";
import { createOryCMSToken } from "@/tokens";
import { dispatchOryCMSTokenLink } from "@/auth/token-links";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

// POST /api/orycms/users/:id/send-reset-link — Super Admin only (users:manage).
// Lets a Super Admin trigger a password-reset email for any team member directly,
// without the member having to use "Forgot password" themselves.
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "users", "manage");
    const { id } = await params;
    const user = await getOryCMSUser(id);

    const rawToken = await createOryCMSToken({ type: "reset", email: user.email, userId: user.id });
    const dispatch = await dispatchOryCMSTokenLink(request, "reset", user.email, rawToken);

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "send-reset-link",
      resource: "users",
      resourceId: user.id,
      metadata: { email: user.email, emailed: dispatch.emailed },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return oryJsonOk({ email: user.email, emailed: dispatch.emailed, resetLink: dispatch.link });
  } catch (err) {
    return toErrorResponse(err);
  }
}
