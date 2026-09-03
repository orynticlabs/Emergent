import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSClients, createOryCMSClient } from "@/clients";
import type { OryCMSClientStatus } from "@/clients";
import { recordOryCMSAuditLog } from "@/audit";

// GET /api/orycms/clients — list all clients
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "clients", "read");
    return oryJsonOk(await listOryCMSClients());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/clients — onboard a new client
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "clients", "create");
    const body = (await request.json()) as {
      name?: string;
      industry?: string | null;
      website?: string | null;
      contactName?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
      status?: string;
      notes?: string | null;
    };
    if (!body.name?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Client name is required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const client = await createOryCMSClient(
      {
        name: body.name.trim(),
        industry: body.industry,
        website: body.website,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        status: body.status as OryCMSClientStatus | undefined,
        notes: body.notes,
      },
      session.userId,
    );
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "clients",
      resourceId: client.id,
      metadata: { name: client.name },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(client, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
