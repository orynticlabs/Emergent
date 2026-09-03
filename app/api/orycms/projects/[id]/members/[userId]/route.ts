import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { updateOryCMSProjectMemberRole, removeOryCMSProjectMember, assertOryCMSProjectAccess } from "@/projects";
import type { OryCMSProjectMemberRole } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string; userId: string }> };

// PATCH /api/orycms/projects/:id/members/:userId — change a member's project role
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id, userId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    const body = (await request.json()) as { role?: OryCMSProjectMemberRole };
    if (!body.role) {
      return toErrorResponse(
        Object.assign(new Error("role is required."), { code: "VALIDATION_ERROR", statusCode: 422 }),
      );
    }
    const member = await updateOryCMSProjectMemberRole(id, userId, body.role);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: id,
      metadata: { memberId: userId, role: body.role },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(member);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/projects/:id/members/:userId — remove a team member
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id, userId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    await removeOryCMSProjectMember(id, userId);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: id,
      metadata: { removedMemberId: userId },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ userId, removed: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
