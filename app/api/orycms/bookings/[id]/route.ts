import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSBooking, updateOryCMSBookingStatus, deleteOryCMSBooking } from "@/bookings";
import type { OryCMSBookingStatus } from "@/bookings";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

const VALID_STATUSES: OryCMSBookingStatus[] = ["confirmed", "canceled", "completed"];

// GET /api/orycms/bookings/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "bookings", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSBooking(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/bookings/:id — status transitions only (confirm/cancel/complete)
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "bookings", "update");
    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !VALID_STATUSES.includes(body.status as OryCMSBookingStatus)) {
      return toErrorResponse(
        Object.assign(new Error("Status must be one of: confirmed, canceled, completed."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "status",
        }),
      );
    }

    const updated = await updateOryCMSBookingStatus(id, body.status as OryCMSBookingStatus);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "bookings",
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

// DELETE /api/orycms/bookings/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "bookings", "delete");
    const { id } = await params;
    await deleteOryCMSBooking(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "bookings",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
