import { NextResponse } from "next/server";
import { listActiveOryCMSCaseStudies } from "@/case-studies";

// GET /api/orycms/case-studies/public — active case studies only, no session
// required (exempted in middleware.ts's PUBLIC_CASE_STUDIES_GET_RE). Read by
// the marketing site's home and portfolio pages to render real project work.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const caseStudies = await listActiveOryCMSCaseStudies();
    return NextResponse.json({ success: true, data: caseStudies });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
