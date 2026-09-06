import { NextResponse } from "next/server";
import { listActiveOryCMSTestimonials } from "@/testimonials";

// GET /api/orycms/testimonials/public — active testimonials only, no session
// required (exempted in middleware.ts's PUBLIC_TESTIMONIALS_GET_RE). Read by
// the marketing site's About page to render "How the studio actually works".
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await listActiveOryCMSTestimonials();
    return NextResponse.json({ success: true, data: testimonials });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
