import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createOryCMSUserSession,
  verifyOryCMSMfaLoginCode,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/auth";
import { getOryCMSPool } from "@/lib/db";
import { toErrorResponse } from "@/lib/route-guards";

// POST /api/orycms/auth/mfa/login-verify - second step of login for accounts
// with MFA enabled. Public (no session cookie exists yet at this point - the
// caller only has the challengeToken returned by /auth/login). Checks the
// submitted TOTP code against the challenge issued there and, ONLY on
// success, creates the real session and sets the session cookie - identical
// to the non-MFA path in /auth/login. A wrong code never creates a session.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { challengeToken?: string; code?: string };
    if (!body.challengeToken || !body.code) {
      return toErrorResponse(
        Object.assign(new Error("Challenge token and code are required."), {
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
    const { userId } = await verifyOryCMSMfaLoginCode(body.challengeToken, body.code, pool);
    const rawToken = await createOryCMSUserSession(pool, userId);

    const response = NextResponse.json({ success: true, data: { userId } });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (err) {
    return toErrorResponse(err);
  }
}
