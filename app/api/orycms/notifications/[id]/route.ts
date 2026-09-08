import type { NextRequest } from "next/server";
import { protectOryCMSAdminRoute } from "@/auth";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { markOryCMSNotificationRead } from "@/notifications";

type RouteCtx = { params: Promise<{ id: string }> };

// PATCH /api/orycms/notifications/:id - mark a notification read/unread
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const session = await protectOryCMSAdminRoute(request);
    const { id } = await params;
    const body = (await request.json()) as { isRead?: boolean };
    await markOryCMSNotificationRead(id, session.userId, body.isRead ?? true);
    return oryJsonOk({ id, isRead: body.isRead ?? true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
