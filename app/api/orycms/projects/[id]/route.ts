import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSProject, updateOryCMSProject, deleteOryCMSProject, assertOryCMSProjectAccess } from "@/projects";
import type { OryCMSProjectStatus } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/projects/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    return oryJsonOk(await getOryCMSProject(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/projects/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    const body = (await request.json()) as {
      name?: string;
      description?: string | null;
      status?: OryCMSProjectStatus;
      startDate?: string | null;
      dueDate?: string | null;
      ownerId?: string | null;
      clientId?: string | null;
    };
    const project = await updateOryCMSProject(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(project);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/projects/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "delete");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    await deleteOryCMSProject(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "projects",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
