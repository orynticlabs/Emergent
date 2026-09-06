import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSCompanies, createOryCMSCompany } from "@/companies";
import { recordOryCMSAuditLog } from "@/audit";

// GET /api/orycms/companies — list all companies (admin)
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "companies", "read");
    return oryJsonOk(await listOryCMSCompanies());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/companies — add a new company wordmark
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "companies", "create");
    const body = (await request.json()) as {
      name?: string;
      logoUrl?: string | null;
      active?: boolean;
      sortOrder?: number;
    };
    if (!body.name?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Company name is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const company = await createOryCMSCompany({
      name: body.name.trim(),
      logoUrl: body.logoUrl,
      active: body.active,
      sortOrder: body.sortOrder,
    });
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "companies",
      resourceId: company.id,
      metadata: { name: company.name },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(company, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
