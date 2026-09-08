import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSMfaEnrollment } from "@/audit";

// GET /api/orycms/audit/mfa-status - who has MFA enabled, for the Console
// Logs page. Guarded the same as the general audit log (audit:read) - per
// the default role matrix (orycms/rbac/rbac.engine.ts) that's Super Admin
// (manage) and Admin (read) only; every other role gets FORBIDDEN.
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "audit", "read");
    const users = await listOryCMSMfaEnrollment();
    return oryJsonOk({ users });
  } catch (err) {
    return toErrorResponse(err);
  }
}
