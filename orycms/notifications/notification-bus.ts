import type { OryCMSNotificationRecord } from "./notifications.repo";

/**
 * In-process pub/sub for pushing a freshly-created notification straight to
 * any open SSE connection for that user, without the client having to poll.
 *
 * This is process-local: on a single Node server (the default for this app)
 * every request shares the same module instance, so it works out of the box.
 * If OryCMS is ever run across multiple server instances behind a load
 * balancer, a subscriber connected to instance A won't hear about a
 * notification created on instance B — that would need a shared bus (e.g.
 * Postgres LISTEN/NOTIFY or Redis pub/sub) instead of this module.
 */

type Listener = (notification: OryCMSNotificationRecord) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribeToOryCMSNotifications(userId: string, listener: Listener): () => void {
  let set = listeners.get(userId);
  if (!set) {
    set = new Set();
    listeners.set(userId, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set && set.size === 0) listeners.delete(userId);
  };
}

export function publishOryCMSNotification(notification: OryCMSNotificationRecord): void {
  listeners.get(notification.userId)?.forEach((listener) => listener(notification));
}
