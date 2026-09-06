import type { NextRequest } from "next/server";
import { protectOryCMSAdminRoute, verifyOryCMSMfaSetupCode } from "@/auth";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { recordOryCMSAuditLog } from "@/audit";

// POST /api/orycms/auth/mfa/verify — check the first authenticator code for a
// pending MFA enrollment and, on success, activate MFA for the current user
// (encrypted secret + mfaEnabled/mfaEnabledAt persisted in orycms_users).
// Ownership (setup token must belong to the caller's own session) and the
// "don't overwrite an already-enabled account" guard both live in
// verifyOryCMSMfaSetupCode, ahead of any database write.
export async function POST(request: NextRequest) {
  try {
    const session = await protectOryCMSAdminRoute(request);

    const body = (await request.json()) as { setupToken?: string; code?: string };
    if (!body.setupToken || !body.code) {
      return toErrorResponse(
        Object.assign(new Error("Setup token and code are required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    if (!/^\d{6}$/.test(body.code)) {
      return toErrorResponse(
        Object.assign(new Error("Enter the 6-digit code from your authenticator app."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }

    await verifyOryCMSMfaSetupCode(session.userId, body.setupToken, body.code);

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "enable-mfa",
      resource: "auth",
      resourceId: session.userId,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    }).catch(() => {});

    return oryJsonOk({ verified: true, mfaEnabled: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
