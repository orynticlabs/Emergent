import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import {
  listOryCMSProjectTasks,
  createOryCMSProjectTask,
  assertOryCMSProjectAccess,
  getOryCMSProject,
  sendOryCMSTaskAssignmentEmail,
} from "@/projects";
import type { OryCMSTaskPriority, OryCMSTaskStatus, OryCMSTaskType } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";
import { createOryCMSNotification } from "@/notifications";
import { oryAppOrigin } from "@/auth/token-links";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/projects/:id/tasks — list a project's tasks
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    const { id } = await params;
    await assertOryCMSProjectAccess({ userId: session.userId, roleName: session.roleName }, id);
    return oryJsonOk(await listOryCMSProjectTasks(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/projects/:id/tasks — create a task on a project
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "projects", "update");
    const { id } = await params;
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
    if (!body.title?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Task title is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const task = await createOryCMSProjectTask(id, {
      title: body.title.trim(),
      description: body.description,
      status: body.status,
      priority: body.priority,
      type: body.type,
      assigneeId: body.assigneeId,
      parentId: body.parentId,
      startDate: body.startDate,
      dueDate: body.dueDate,
    });
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "projects",
      resourceId: task.id,
      metadata: { projectId: id, title: task.title },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    if (task.assigneeId && task.assigneeId !== session.userId) {
      const project = await getOryCMSProject(id);
      await createOryCMSNotification({
        userId: task.assigneeId,
        type: "task_assignment",
        title: `You were assigned "${task.title}"`,
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
        reassigned: false,
        origin: oryAppOrigin(request),
      });
    }
    return oryJsonOk(task, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
