import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSTestimonials, createOryCMSTestimonial } from "@/testimonials";
import { recordOryCMSAuditLog } from "@/audit";

type TestimonialBody = {
  name?: string;
  role?: string | null;
  quote?: string;
  imageUrl?: string | null;
  active?: boolean;
  sortOrder?: number;
};

// GET /api/orycms/testimonials — list all testimonials (admin)
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "testimonials", "read");
    return oryJsonOk(await listOryCMSTestimonials());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/testimonials — add a new testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "testimonials", "create");
    const body = (await request.json()) as TestimonialBody;
    if (!body.name?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Name is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "name",
        }),
      );
    }
    if (!body.quote?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Quote is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "quote",
        }),
      );
    }
    const testimonial = await createOryCMSTestimonial({
      name: body.name.trim(),
      role: body.role,
      quote: body.quote.trim(),
      imageUrl: body.imageUrl,
      active: body.active,
      sortOrder: body.sortOrder,
    });
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "testimonials",
      resourceId: testimonial.id,
      metadata: { name: testimonial.name },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(testimonial, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
