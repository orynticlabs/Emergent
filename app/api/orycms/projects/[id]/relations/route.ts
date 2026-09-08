import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSBlockingRelationsForProject, assertOryCMSProjectAccess } from "@/projects";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/projects/:id/relations - every "blocks" pair in the project (for Gantt arrows)
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    return oryJsonOk(await listOryCMSBlockingRelationsForProject(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
