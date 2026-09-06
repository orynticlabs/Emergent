import type { NextRequest } from "next/server";
import { protectOryCMSAdminRoute, startOryCMSMfaSetup } from "@/auth";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";

// POST /api/orycms/auth/mfa/setup — start MFA enrollment for the current user.
// Every authenticated admin manages their own MFA — no separate resource permission
// (same self-scoped pattern as GET /auth/me and /notifications).
//
// Generates a fresh TOTP secret + QR code and returns them for the setup dialog.
// The secret is NOT written to orycms_users here — it only lives in a short-lived
// setup token until verifyOryCMSMfaSetupCode confirms the app is enrolled.
export async function POST(request: NextRequest) {
  try {
    const session = await protectOryCMSAdminRoute(request);
    const setup = await startOryCMSMfaSetup(session.userId, session.email);
    return oryJsonOk(setup);
  } catch (err) {
    return toErrorResponse(err);
  }
}
