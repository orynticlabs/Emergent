import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSRolePermissions, setOryCMSRolePermissions, getOryCMSPermissionsByIds } from "@/roles";
import { getOryCMSUserPermissions, permissionsWithinCeiling } from "@/rbac";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/roles/:id/permissions - list a role's permissions
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "roles", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSRolePermissions(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PUT /api/orycms/roles/:id/permissions - replace the role's permission set
export async function PUT(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "roles", "update");
    const { id } = await params;
    const body = (await request.json()) as { permissionIds?: string[] };
    const permissionIds = Array.isArray(body.permissionIds) ? body.permissionIds : [];

    // Resolve ids -> {resource, action} up front: this rejects unknown ids
    // (silently accepting them was the old behavior) AND gives us what we
    // need for the ceiling check below.
    const resolved = await getOryCMSPermissionsByIds(permissionIds);
    if (resolved.length !== permissionIds.length) {
      return toErrorResponse(
        Object.assign(new Error("One or more permission ids don't exist."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }

    // Ceiling check: a caller can only grant permissions they themselves
    // hold - otherwise `roles:update` alone would let any role escalate
    // itself (or another role) past its own current access.
    const callerPermissions = await getOryCMSUserPermissions(session.roleName ?? "");
    if (!permissionsWithinCeiling(callerPermissions, resolved)) {
      return toErrorResponse(
        Object.assign(
          new Error("You can't grant a permission you don't currently hold yourself."),
          { code: "FORBIDDEN", statusCode: 403 },
        ),
      );
    }

    await setOryCMSRolePermissions(id, permissionIds);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "roles",
      resourceId: id,
      metadata: { permissionCount: permissionIds.length },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ roleId: id, permissionIds });
  } catch (err) {
    return toErrorResponse(err);
  }
}
