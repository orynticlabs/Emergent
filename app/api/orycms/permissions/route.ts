import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSPermissions } from "@/roles";

// GET /api/orycms/permissions — the full catalog of assignable permissions,
// used to render the resource × action matrix on the role detail page.
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "roles", "read");
    return oryJsonOk(await listOryCMSPermissions());
  } catch (err) {
    return toErrorResponse(err);
  }
}
