import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSCaseStudy, updateOryCMSCaseStudy, deleteOryCMSCaseStudy } from "@/case-studies";
import type { OryCMSCaseStudyResult } from "@/case-studies";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

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

// GET /api/orycms/case-studies/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "case-studies", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSCaseStudy(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/case-studies/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "case-studies", "update");
    const { id } = await params;
    const body = (await request.json()) as CaseStudyBody;
    const caseStudy = await updateOryCMSCaseStudy(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "case-studies",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(caseStudy);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/case-studies/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "case-studies", "delete");
    const { id } = await params;
    await deleteOryCMSCaseStudy(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "case-studies",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
