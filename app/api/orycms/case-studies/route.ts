import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSCaseStudies, createOryCMSCaseStudy } from "@/case-studies";
import type { OryCMSCaseStudyResult } from "@/case-studies";
import { recordOryCMSAuditLog } from "@/audit";

type CaseStudyBody = {
  slug?: string;
  title?: string;
  category?: string | null;
  industry?: string | null;
  client?: string | null;
  timeline?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  challenge?: string | null;
  approach?: string[];
  results?: OryCMSCaseStudyResult[];
  tags?: string[];
  active?: boolean;
  sortOrder?: number;
};

// GET /api/orycms/case-studies — list all case studies (admin)
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "case-studies", "read");
    return oryJsonOk(await listOryCMSCaseStudies());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/case-studies — add a new case study
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "case-studies", "create");
    const body = (await request.json()) as CaseStudyBody;
    if (!body.title?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Title is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "title",
        }),
      );
    }
    if (!body.slug?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Slug is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "slug",
        }),
      );
    }
    const caseStudy = await createOryCMSCaseStudy({
      slug: body.slug.trim(),
      title: body.title.trim(),
      category: body.category,
      industry: body.industry,
      client: body.client,
      timeline: body.timeline,
      imageUrl: body.imageUrl,
      description: body.description,
      challenge: body.challenge,
      approach: body.approach,
      results: body.results,
      tags: body.tags,
      active: body.active,
      sortOrder: body.sortOrder,
    });
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "case-studies",
      resourceId: caseStudy.id,
      metadata: { title: caseStudy.title, slug: caseStudy.slug },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(caseStudy, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
