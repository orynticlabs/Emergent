import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSHireStaffRequests, createOryCMSHireStaffRequest } from "@/hire-staff";

type HireStaffRequestBody = {
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  engagementModel?: string | null;
  teamSize?: string | null;
  timeline?: string | null;
  message?: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/orycms/hire-staff-requests — list all requests (admin only)
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "hire-staff-requests", "read");
    return oryJsonOk(await listOryCMSHireStaffRequests());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/hire-staff-requests — public: the /hire-staff page's popup
// form submits here with no session (exempted in middleware.ts alongside the
// Razorpay/WhatsApp webhooks — the one other place a POST bypasses the
// session check). No audit log here: audit entries attribute an action to an
// authenticated actor, and an anonymous visitor submission has none.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HireStaffRequestBody;

    if (!body.name?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Name is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "name",
        }),
      );
    }
    if (!body.email?.trim() || !EMAIL_RE.test(body.email.trim())) {
      return toErrorResponse(
        Object.assign(new Error("A valid email is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "email",
        }),
      );
    }

    const created = await createOryCMSHireStaffRequest({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      role: body.role?.trim() || null,
      engagementModel: body.engagementModel?.trim() || null,
      teamSize: body.teamSize?.trim() || null,
      timeline: body.timeline?.trim() || null,
      message: body.message?.trim() || null,
    });
    return oryJsonOk(created, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
