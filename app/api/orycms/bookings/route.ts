import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSBookings } from "@/bookings";
import type { OryCMSBookingStatus } from "@/bookings";

// GET /api/orycms/bookings — list bookings (admin only), optional ?status=&from=&to=
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "bookings", "read");
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as OryCMSBookingStatus | null;
    return oryJsonOk(
      await listOryCMSBookings({
        status: status ?? undefined,
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
      }),
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}
