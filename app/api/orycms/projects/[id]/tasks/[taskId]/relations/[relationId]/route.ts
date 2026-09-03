import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { removeOryCMSTaskRelation, assertOryCMSProjectAccess } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string; taskId: string; relationId: string }> };

// DELETE /api/orycms/projects/:id/tasks/:taskId/relations/:relationId
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id, taskId, relationId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    await removeOryCMSTaskRelation(relationId);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: taskId,
      metadata: { projectId: id, removedRelationId: relationId },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id: relationId, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
