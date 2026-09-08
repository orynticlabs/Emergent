import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSProjectsByClient } from "@/projects";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/clients/:id/projects - this client's projects visible to the caller
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    const { id } = await params;
    return oryJsonOk(
      await listOryCMSProjectsByClient({ userId: session.userId, roleName: session.roleName }, id),
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}
