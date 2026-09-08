import type { NextRequest } from "next/server";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { createOryCMSBooking } from "@/bookings";

type BookingBody = {
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  start?: string;
  end?: string;
  visitorTimezone?: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/orycms/bookings/public - the site-wide "Book a Call" widget
// submits here with no session (exempted in middleware.ts alongside
// /api/orycms/hire-staff-requests - a visitor has no OryCMS account). GET
// on the base /api/orycms/bookings route is a separate, session-guarded
// admin listing.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookingBody;

    if (!body.name?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Name is required."), { code: "VALIDATION_ERROR", statusCode: 422, field: "name" }),
      );
    }
    if (!body.email?.trim() || !EMAIL_RE.test(body.email.trim())) {
      return toErrorResponse(
        Object.assign(new Error("A valid email is required."), { code: "VALIDATION_ERROR", statusCode: 422, field: "email" }),
      );
    }
    if (!body.start || !body.end || Number.isNaN(Date.parse(body.start)) || Number.isNaN(Date.parse(body.end))) {
      return toErrorResponse(
        Object.assign(new Error("A valid time slot is required."), { code: "VALIDATION_ERROR", statusCode: 422, field: "start" }),
      );
    }

    const created = await createOryCMSBooking({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      notes: body.notes?.trim() || null,
      start: new Date(body.start).toISOString(),
      end: new Date(body.end).toISOString(),
      visitorTimezone: body.visitorTimezone || null,
    });
    return oryJsonOk(created, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
