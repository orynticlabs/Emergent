import { NextResponse } from "next/server";
import { listActiveOryCMSCompanies } from "@/companies";

// GET /api/orycms/companies/public — active companies only, no session
// required (exempted in middleware.ts's PUBLIC_COMPANIES_GET_RE). Read by the
// marketing site's ClientMarquee to render the "Trusted by" wordmark row.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await listActiveOryCMSCompanies();
    return NextResponse.json({ success: true, data: companies });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
