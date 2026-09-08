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

// GET /api/orycms/hire-staff-requests - list all requests (admin only)
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "hire-staff-requests", "read");
    return oryJsonOk(await listOryCMSHireStaffRequests());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/hire-staff-requests - public: the /hire-staff page's popup
// form submits here with no session (exempted in middleware.ts alongside the
// Razorpay/WhatsApp webhooks - the one other place a POST bypasses the
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
    if (!body.phone?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Phone number is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "phone",
        }),
      );
    }
    if (!body.company?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Company is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "company",
        }),
      );
    }
    if (!body.role?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Role needed is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "role",
        }),
      );
    }
    if (!body.engagementModel?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Engagement model is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "engagementModel",
        }),
      );
    }
    if (!body.teamSize?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Team size is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "teamSize",
        }),
      );
    }
    if (!body.timeline?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Timeline is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "timeline",
        }),
      );
    }
    if (!body.message?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Description / project details is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
          field: "message",
        }),
      );
    }

    const created = await createOryCMSHireStaffRequest({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      company: body.company.trim(),
      role: body.role.trim(),
      engagementModel: body.engagementModel.trim(),
      teamSize: body.teamSize.trim(),
      timeline: body.timeline.trim(),
      message: body.message.trim(),
    });
    return oryJsonOk(created, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
