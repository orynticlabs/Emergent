import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { getOryCMSAnnouncement, updateOryCMSAnnouncement, deleteOryCMSAnnouncement } from "@/announcements";
import type { OryCMSAnnouncementColor } from "@/announcements";
import { recordOryCMSAuditLog } from "@/audit";

type RouteCtx = { params: Promise<{ id: string }> };

// GET /api/orycms/announcements/:id
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    await guardOryCMS(request, "announcements", "read");
    const { id } = await params;
    return oryJsonOk(await getOryCMSAnnouncement(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/orycms/announcements/:id
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "announcements", "update");
    const { id } = await params;
    const body = (await request.json()) as {
      tag?: string;
      color?: OryCMSAnnouncementColor;
      message?: string;
      link?: string | null;
      ctaLabel?: string | null;
      active?: boolean;
      sortOrder?: number;
    };
    const announcement = await updateOryCMSAnnouncement(id, body);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "update",
      resource: "announcements",
      resourceId: id,
      metadata: { fields: Object.keys(body) },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(announcement);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/orycms/announcements/:id
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await guardOryCMS(request, "announcements", "delete");
    const { id } = await params;
    await deleteOryCMSAnnouncement(id);
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "delete",
      resource: "announcements",
      resourceId: id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk({ id, deleted: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
