import { NextRequest, NextResponse } from "next/server";
import { getOryCMSAvailableSlots } from "@/bookings";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/orycms/bookings/slots/public?date=YYYY-MM-DD - open time slots for
// one calendar date, no session required (exempted in middleware.ts). Read
// by the "Book a Call" widget once a visitor picks a day.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "?date=YYYY-MM-DD is required." } }, { status: 422 });
  }
  try {
    const slots = await getOryCMSAvailableSlots(date);
    return NextResponse.json({ success: true, data: { slots } });
  } catch {
    return NextResponse.json({ success: true, data: { slots: [] } });
  }
}
