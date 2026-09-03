import type { NextRequest } from "next/server";
import {
  protectOryCMSAdminRoute,
  disableOryCMSMfa,
  destroyOryCMSUserSessions,
  SESSION_COOKIE,
} from "@/auth";
import { getOryCMSPool } from "@/lib/db";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { recordOryCMSAuditLog } from "@/audit";

// POST /api/orycms/auth/mfa/disable — remove MFA from the CURRENT user's own
// account. Requires all three: an authenticated session (protectOryCMSAdminRoute),
// the current password, and a current TOTP code — any one or two of these
// alone must not be enough (see disableOryCMSMfa's doc for why). identity
// is always session.userId; the client can never name a different account.
//
// On success this account no longer has a usable session: every session row
// for the user is destroyed (destroyOryCMSUserSessions — same call used
// after password reset) and this response clears the caller's own cookie.
// No replacement session is created.
export async function POST(request: NextRequest) {
  try {
    const session = await protectOryCMSAdminRoute(request);

    const body = (await request.json()) as { password?: string; code?: string };
    if (!body.password || !body.code) {
      return toErrorResponse(
        Object.assign(new Error("Password and code are required."), {
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

    const pool = getOryCMSPool();
    await disableOryCMSMfa(session.userId, body.password, body.code, pool);

    await destroyOryCMSUserSessions(pool, session.userId);

    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "disable-mfa",
      resource: "auth",
      resourceId: session.userId,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    }).catch(() => {});

    const response = oryJsonOk({ disabled: true });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch (err) {
    return toErrorResponse(err);
  }
}
