import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSBookingAvailability, updateOryCMSBookingAvailability } from "@/bookings";
import type { OryCMSBookingAvailabilityInput } from "@/bookings";
import { recordOryCMSAuditLog } from "@/audit";

// GET /api/orycms/bookings/availability — admin reads the weekly schedule + settings
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "bookings", "read");
    return oryJsonOk(await getOryCMSBookingAvailability());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PUT /api/orycms/bookings/availability — admin saves the weekly schedule + settings
export async function PUT(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "bookings", "update");
    const body = (await request.json()) as OryCMSBookingAvailabilityInput;

    if (!Array.isArray(body.days) || body.days.length !== 7) {
      return toErrorResponse(
        Object.assign(new Error("All seven weekdays are required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "days",
        }),
      );
    }

    const updated = await updateOryCMSBookingAvailability({ days: body.days, settings: body.settings ?? {} });
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "bookings",
      metadata: { availability: true },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(updated);
  } catch (err) {
    return toErrorResponse(err);
  }
}
