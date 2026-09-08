import { NextResponse } from "next/server";
import { listActiveOryCMSAnnouncements } from "@/announcements";

// GET /api/orycms/announcements/public - active announcements only, no session
// required (exempted in middleware.ts's PUBLIC_ANNOUNCEMENTS_GET_RE). Read by
// the marketing site's Navbar to render the live announcement bar.
//
// This handler takes no `request` param and calls no dynamic API (cookies,
// headers, etc.), so without `dynamic = "force-dynamic"` Next.js treats it as
// a static route: it runs the DB query once at build time and serves that
// cached response forever, so newly saved announcements never show up.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const announcements = await listActiveOryCMSAnnouncements();
    return NextResponse.json({ success: true, data: announcements });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
