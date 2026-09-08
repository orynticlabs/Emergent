import type { NextRequest } from "next/server";
import { protectOryCMSAdminRoute } from "@/auth";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { listOryCMSNotifications, getOryCMSUnreadNotificationCount } from "@/notifications";
import type { OryCMSNotificationType } from "@/notifications";

// GET /api/orycms/notifications?type=project_assignment|task_assignment&unread=true
// Every authenticated user reads their own notifications - no separate resource permission.
export async function GET(request: NextRequest) {
  try {
    const session = await protectOryCMSAdminRoute(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as OryCMSNotificationType | null;
    const unreadOnly = searchParams.get("unread") === "true";

    const [items, unreadCount] = await Promise.all([
      listOryCMSNotifications(session.userId, { type: type ?? undefined, unreadOnly }),
      getOryCMSUnreadNotificationCount(session.userId),
    ]);
    return oryJsonOk({ items, unreadCount });
  } catch (err) {
    return toErrorResponse(err);
  }
}
