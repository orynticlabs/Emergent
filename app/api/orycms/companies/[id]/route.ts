import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSCompany, updateOryCMSCompany, deleteOryCMSCompany } from "@/companies";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/companies/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "companies", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSCompany(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/companies/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "companies", "update");
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      logoUrl?: string | null;
      active?: boolean;
      sortOrder?: number;
    };
    const company = await updateOryCMSCompany(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "companies",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(company);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/companies/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "companies", "delete");
    const { id } = await params;
    await deleteOryCMSCompany(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "companies",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
