import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import {
  updateOryCMSProjectTask,
  deleteOryCMSProjectTask,
  assertOryCMSProjectAccess,
  getOryCMSProjectTask,
  getOryCMSProject,
  sendOryCMSTaskAssignmentEmail,
} from "@/projects";
import type { OryCMSTaskPriority, OryCMSTaskStatus, OryCMSTaskType } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";
import { createOryCMSNotification } from "@/notifications";
import { oryAppOrigin } from "@/auth/token-links";

type RouteCtx = { params: Promise<{ id: string; taskId: string }> };

// PATCH /api/orycms/projects/:id/tasks/:taskId
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id, taskId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    const body = (await request.json()) as {
      title?: string;
      description?: string | null;
      status?: OryCMSTaskStatus;
      priority?: OryCMSTaskPriority;
      type?: OryCMSTaskType;
      assigneeId?: string | null;
      parentId?: string | null;
      startDate?: string | null;
      dueDate?: string | null;
    };
    const previousAssigneeId =
      body.assigneeId !== undefined ? (await getOryCMSProjectTask(taskId)).assigneeId : undefined;
    const task = await updateOryCMSProjectTask(taskId, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "projects",
      resourceId: taskId,
      metadata: { projectId: id, fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    if (
      task.assigneeId &&
      task.assigneeId !== previousAssigneeId &&
      task.assigneeId !== session.userId
    ) {
      const project = await getOryCMSProject(id);
      const reassigned = previousAssigneeId != null;
      await createOryCMSNotification({
        userId: task.assigneeId,
        type: "task_assignment",
        title: `You were ${reassigned ? "reassigned" : "assigned"} "${task.title}"`,
        body: `In project ${project.name}`,
        actorId: session.userId,
        actorName: session.name || session.email,
        projectId: id,
        taskId: task.id,
        link: `/admin/projectx/${id}`,
      });
      await sendOryCMSTaskAssignmentEmail({
        task,
        projectName: project.name,
        projectId: id,
        actorName: session.name || session.email,
        reassigned,
        origin: oryAppOrigin(request),
      });
    }
    return oryJsonOk(task);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/projects/:id/tasks/:taskId
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id, taskId } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    await deleteOryCMSProjectTask(taskId);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "projects",
      resourceId: taskId,
      metadata: { projectId: id },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id: taskId, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
