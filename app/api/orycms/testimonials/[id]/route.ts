import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSTestimonial, updateOryCMSTestimonial, deleteOryCMSTestimonial } from "@/testimonials";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

type TestimonialBody = {
  name?: string;
  role?: string | null;
  quote?: string;
  imageUrl?: string | null;
  active?: boolean;
  sortOrder?: number;
};

// GET /api/orycms/testimonials/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "testimonials", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSTestimonial(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/testimonials/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "testimonials", "update");
    const { id } = await params;
    const body = (await request.json()) as TestimonialBody;
    const testimonial = await updateOryCMSTestimonial(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "testimonials",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(testimonial);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/testimonials/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "testimonials", "delete");
    const { id } = await params;
    await deleteOryCMSTestimonial(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "testimonials",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
