import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSPool } from "@/lib/db";
import {
  createRazorpayPaymentLink,
  createOryCMSPaymentLinkRecord,
  listOryCMSPaymentLinks,
} from "@/payments";

// GET /api/orycms/payments/links — list payment links.
// POST /api/orycms/payments/links — create a new Razorpay payment link.
// Gated by the "payments" RBAC resource (Super Admin/Admin by default —
// see ORYCMS_DEFAULT_PERMISSIONS) since creating a real payment link is a
// financial action, not a self-scoped personal-account one.

export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "payments", "read");
    const links = await listOryCMSPaymentLinks();
    return oryJsonOk({ links });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "payments", "create");

    const body = (await request.json()) as {
      amount?: number;
      currency?: string;
      description?: string;
      customerName?: string;
      customerEmail?: string;
      customerContact?: string;
    };

    if (!body.amount || body.amount <= 0 || !Number.isFinite(body.amount)) {
      return toErrorResponse(
        Object.assign(new Error("A positive amount is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }

    const pool = getOryCMSPool();
    const link = await createRazorpayPaymentLink({
      amount: Math.round(body.amount),
      currency: body.currency,
      description: body.description,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerContact: body.customerContact,
    });

    const record = await createOryCMSPaymentLinkRecord(
      {
        razorpayLinkId: link.id,
        amount: link.amount,
        currency: link.currency,
        description: body.description ?? null,
        customerName: body.customerName ?? null,
        customerEmail: body.customerEmail ?? null,
        customerContact: body.customerContact ?? null,
        status: link.status,
        shortUrl: link.short_url,
        createdBy: session.userId,
      },
      pool,
    );

    return oryJsonOk({ link: record }, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
