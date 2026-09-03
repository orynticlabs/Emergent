import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSUser, updateOryCMSUser, deleteOryCMSUser, countOryCMSActiveUsersByRoleName } from "@/users";
import { getOryCMSRole } from "@/roles";
import { ORYCMS_SUPER_ADMIN_ROLE } from "@/rbac";
import { recordOryCMSAuditLog } from "@/audit";

/**
 * Throws VALIDATION_ERROR if `beforeRoleName` is the Super Admin role and
 * this change would leave zero active Super Admins — shared by the role
 * change and delete paths below.
 */
async function assertNotLastSuperAdmin(beforeRoleName: string | null | undefined): Promise<void> {
  if (beforeRoleName !== ORYCMS_SUPER_ADMIN_ROLE) return;
  const activeCount = await countOryCMSActiveUsersByRoleName(ORYCMS_SUPER_ADMIN_ROLE);
  if (activeCount <= 1) {
    throw Object.assign(
      new Error("At least one active Super Admin must remain — assign another Super Admin first."),
      { code: "VALIDATION_ERROR", statusCode: 422 },
    );
  }
}

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/users/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "users", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSUser(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/users/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "users", "update");
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      roleId?: string | null;
      status?: "active" | "inactive" | "pending";
    };

    // Self-elevation guard: you can grant/change OTHER users' roles with
    // users:update, but never your own — otherwise this permission alone
    // would let anyone with it hand themselves a more powerful role.
    if (body.roleId !== undefined && id === session.userId) {
      return toErrorResponse(
        Object.assign(new Error("You cannot change your own role."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }

    const before = await getOryCMSUser(id);

    // Ceiling: only an existing Super Admin can hand out the Super Admin role.
    if (body.roleId) {
      const targetRole = await getOryCMSRole(body.roleId);
      if (targetRole.name === ORYCMS_SUPER_ADMIN_ROLE && session.roleName !== ORYCMS_SUPER_ADMIN_ROLE) {
        return toErrorResponse(
          Object.assign(new Error("Only a Super Admin can assign the Super Admin role."), {
            code: "FORBIDDEN",
            statusCode: 403,
          }),
        );
      }
    }

    // Last-Super-Admin guard: block a role change away from Super Admin, or
    // a deactivation, that would leave the account with zero active ones.
    const losesSuperAdmin =
      (body.roleId !== undefined && body.roleId !== before.roleId) ||
      (body.status !== undefined && body.status !== "active");
    if (losesSuperAdmin) {
      await assertNotLastSuperAdmin(before.roleName);
    }

    const user = await updateOryCMSUser(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "users",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(user);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/users/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "users", "delete");
    const { id } = await params;
    if (id === session.userId) {
      return toErrorResponse(
        Object.assign(new Error("You cannot delete your own account."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const before = await getOryCMSUser(id);
    await assertNotLastSuperAdmin(before.roleName);
    await deleteOryCMSUser(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "users",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
