import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSClient, updateOryCMSClient, deleteOryCMSClient } from "@/clients";
import type { OryCMSClientStatus } from "@/clients";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/clients/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "clients", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSClient(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/clients/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "clients", "update");
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      industry?: string | null;
      website?: string | null;
      contactName?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
      status?: OryCMSClientStatus;
      notes?: string | null;
    };
    const client = await updateOryCMSClient(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "clients",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(client);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/clients/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "clients", "delete");
    const { id } = await params;
    await deleteOryCMSClient(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "clients",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
