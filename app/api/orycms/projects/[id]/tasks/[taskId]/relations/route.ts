import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSTaskRelations, addOryCMSTaskRelation, assertOryCMSProjectAccess } from "@/projects";
import type { OryCMSTaskRelationType } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string; taskId: string }> };

// GET /api/orycms/projects/:id/tasks/:taskId/relations
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    const { id, taskId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    return oryJsonOk(await listOryCMSTaskRelations(taskId));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/projects/:id/tasks/:taskId/relations - link to another task
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id, taskId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    const body = (await request.json()) as {
      relatedTaskId?: string;
      type?: OryCMSTaskRelationType;
    };
    if (!body.relatedTaskId || !body.type) {
      return toErrorResponse(
        Object.assign(new Error("relatedTaskId and type are required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    await addOryCMSTaskRelation(taskId, body.relatedTaskId, body.type);
    const relations = await listOryCMSTaskRelations(taskId);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: taskId,
      metadata: { projectId: id, relatedTaskId: body.relatedTaskId, type: body.type },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(relations, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
