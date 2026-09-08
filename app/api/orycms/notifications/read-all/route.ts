import type { NextRequest } from "next/server";
import { protectOryCMSAdminRoute } from "@/auth";
import { toErrorResponse, oryJsonOk } from "@/lib/route-guards";
import { markAllOryCMSNotificationsRead } from "@/notifications";

// POST /api/orycms/notifications/read-all - mark every notification read for the caller
export async function POST(request: NextRequest) {
  try {
    const session = await protectOryCMSAdminRoute(request);
    await markAllOryCMSNotificationsRead(session.userId);
    return oryJsonOk({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
