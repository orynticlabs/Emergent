import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import {
  getOryCMSHireStaffRequest,
  updateOryCMSHireStaffRequestStatus,
  deleteOryCMSHireStaffRequest,
} from "@/hire-staff";
import type { OryCMSHireStaffRequestStatus } from "@/hire-staff";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

const VALID_STATUSES: OryCMSHireStaffRequestStatus[] = ["new", "contacted", "closed"];

// GET /api/orycms/hire-staff-requests/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "hire-staff-requests", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSHireStaffRequest(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/hire-staff-requests/:id — status transitions only
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "hire-staff-requests", "update");
    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !VALID_STATUSES.includes(body.status as OryCMSHireStaffRequestStatus)) {
      return toErrorResponse(
        Object.assign(new Error("Status must be one of: new, contacted, closed."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "status",
        }),
      );
    }

    const updated = await updateOryCMSHireStaffRequestStatus(id, body.status as OryCMSHireStaffRequestStatus);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "hire-staff-requests",
      resourceId: id,
      metadata: { status: updated.status },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(updated);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/hire-staff-requests/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "hire-staff-requests", "delete");
    const { id } = await params;
    await deleteOryCMSHireStaffRequest(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "hire-staff-requests",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
