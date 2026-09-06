import type { NextRequest } from "next/server";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSAnnouncements, createOryCMSAnnouncement } from "@/announcements";
import type { OryCMSAnnouncementColor } from "@/announcements";
import { recordOryCMSAuditLog } from "@/audit";

// GET /api/orycms/announcements — list all announcements (admin)
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "announcements", "read");
    return oryJsonOk(await listOryCMSAnnouncements());
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/orycms/announcements — create a new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await guardOryCMS(request, "announcements", "create");
    const body = (await request.json()) as {
      tag?: string;
      color?: OryCMSAnnouncementColor;
      message?: string;
      link?: string | null;
      ctaLabel?: string | null;
      active?: boolean;
      sortOrder?: number;
    };
    if (!body.tag?.trim() || !body.message?.trim()) {
      return toErrorResponse(
        Object.assign(new Error("Tag and message are required."), {
          code: "VALIDATION_ERROR",
          statusCode: 422,
        }),
      );
    }
    const announcement = await createOryCMSAnnouncement({
      tag: body.tag.trim(),
      color: body.color,
      message: body.message.trim(),
      link: body.link,
      ctaLabel: body.ctaLabel,
      active: body.active,
      sortOrder: body.sortOrder,
    });
    await recordOryCMSAuditLog({
      userId: session.userId,
      action: "create",
      resource: "announcements",
      resourceId: announcement.id,
      metadata: { tag: announcement.tag },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return oryJsonOk(announcement, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
