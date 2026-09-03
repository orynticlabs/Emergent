import type { NextRequest } from "next/server";
import { protectOryCMSAdminRoute } from "@/auth";
import { toErrorResponse } from "@/lib/route-guards";
import { subscribeToOryCMSNotifications } from "@/notifications";
import type { OryCMSNotificationRecord } from "@/notifications";

// Long-lived Server-Sent Events connection — needs the Node runtime (not edge)
// so it shares the same process/module state as the in-memory notification
// bus that the write side (creating a notification) publishes into.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25_000;

// GET /api/orycms/notifications/stream — pushes new notifications for the caller as they happen
export async function GET(request: NextRequest) {
  let session;
  try {
    session = await protectOryCMSAdminRoute(request);
  } catch (err) {
    return toErrorResponse(err);
  }

  const encoder = new TextEncoder();
  let unsubscribe: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("ready", { ok: true });

      unsubscribe = subscribeToOryCMSNotifications(session.userId, (notification: OryCMSNotificationRecord) => {
        send("notification", notification);
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, HEARTBEAT_MS);
    },
    cancel() {
      unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
