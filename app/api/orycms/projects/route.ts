import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSProjects, createOryCMSProject } from "@/projects";
import type { OryCMSProjectStatus } from "@/projects";
import { recordOryCMSAuditLog } from "@/audit";

// GET /api/orycms/projects — list projects visible to the caller (all of them
// for a Super Admin, only assigned ones for everyone else)
export async function GET(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "projects", "read");
    return oryJsonOk(
      await listOryCMSProjects({ userId: session.userId, roleName: session.roleName }),
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/projects — create a project
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "projects", "create");
    const body = (await request.json()) as {
      name?: string;
      description?: string | null;
      status?: string;
      startDate?: string | null;
      dueDate?: string | null;
      ownerId?: string | null;
      clientId?: string | null;
    };
    if (!body.name?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Project name is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const project = await createOryCMSProject(
      {
        name: body.name.trim(),
        description: body.description,
        status: body.status as OryCMSProjectStatus | undefined,
        startDate: body.startDate,
        dueDate: body.dueDate,
        ownerId: body.ownerId,
        clientId: body.clientId,
      },
      session.userId,
    );
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "projects",
      resourceId: project.id,
      metadata: { name: project.name },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(project, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
