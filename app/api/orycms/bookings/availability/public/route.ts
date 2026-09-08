import { NextResponse } from "next/server";
import { getOryCMSBookingAvailability } from "@/bookings";

// GET /api/orycms/bookings/availability/public - the enabled weekdays + booking
// window, no session required (exempted in middleware.ts). Read by the site-wide
// "Book a Call" widget so it knows which upcoming days are even worth offering -
// actual per-day time slots come from /api/orycms/bookings/slots/public. No PII
// or internal-only fields here, just the shape a calendar widget needs.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const availability = await getOryCMSBookingAvailability();
    return NextResponse.json({
      success: true,
      data: {
        days: availability.days.map((d) => ({ weekday: d.weekday, enabled: d.enabled })),
        bookingWindowDays: availability.settings.bookingWindowDays,
        timezone: availability.settings.timezone,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { days: [], bookingWindowDays: 0, timezone: "Asia/Kolkata" },
    });
  }
}
