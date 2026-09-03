import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSProjectMembers, addOryCMSProjectMember, assertOryCMSProjectAccess, getOryCMSProject } from "@/projects";
import type { OryCMSProjectMemberRole } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";
import { createOryCMSNotification } from "@/notifications";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/projects/:id/members — list a project's team
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    return oryJsonOk(await listOryCMSProjectMembers(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/projects/:id/members — add (or re-role) a team member
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    const body = (await request.json()) as {
      userId?: string;
      role?: OryCMSProjectMemberRole;
    };
    if (!body.userId) {
      return toErrorResponse(
        Object.assign(new Error("userId is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const member = await addOryCMSProjectMember(id, body.userId, body.role ?? "member");
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: id,
      metadata: { addedMemberId: member.userId, role: member.role },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    if (member.userId !== session.userId) {
      const project = await getOryCMSProject(id);
      await createOryCMSNotification({
        userId: member.userId,
        type: "project_assignment",
        title: `You were added to "${project.name}"`,
        body: `Role: ${member.role}`,
        actorId: session.userId,
        actorName: session.name || session.email,
        projectId: id,
        link: `/admin/projectx/${id}`,
      });
    }
    return oryJsonOk(member, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
