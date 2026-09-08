"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Briefcase, Check, CheckCheck, ListTodo, type LucideIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type OryCMSNotificationType = "project_assignment" | "task_assignment";

interface OryCMSNotification {
  id: string;
  type: OryCMSNotificationType;
  title: string;
  body: string | null;
  actorName: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  const body = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!res.ok || !body.success) throw new Error(body.error?.message ?? "Request failed.");
  return body.data as T;
}

const TYPE_META: Record<OryCMSNotificationType, { label: string; icon: LucideIcon; className: string }> = {
  project_assignment: { label: "Project Assignment", icon: Briefcase, className: "bg-info/10 text-info" },
  task_assignment: { label: "Ticket Assignment", icon: ListTodo, className: "bg-warning/10 text-warning" },
};

const FILTERS: { value: "all" | OryCMSNotificationType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "project_assignment", label: "Projects" },
  { value: "task_assignment", label: "Tickets" },
];

/** Short triangle-wave chime for a freshly-arrived notification. Silently no-ops if the browser blocks audio autoplay. */
function playNotificationChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(920, audioContext.currentTime + 0.09);
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.35);
    oscillator.onended = () => void audioContext.close();
  } catch {
    // Ignore audio failures in browsers that block autoplay or audio context startup.
  }
}

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<OryCMSNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | OryCMSNotificationType>("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justArrived, setJustArrived] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchJson<{ items: OryCMSNotification[]; unreadCount: number }>("/api/orycms/notifications")
      .then(({ items, unreadCount }) => {
        setItems(items);
        setUnreadCount(unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live push: a new notification created anywhere for this user arrives
  // here immediately, no refresh or polling needed.
  useEffect(() => {
    const es = new EventSource("/api/orycms/notifications/stream");
    esRef.current = es;
    es.addEventListener("notification", (event) => {
      const notification = JSON.parse((event as MessageEvent).data) as OryCMSNotification;
      setItems((prev) => [notification, ...prev].slice(0, 100));
      setUnreadCount((count) => count + 1);
      setJustArrived(true);
      playNotificationChime();
    });
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!justArrived) return;
    const timeout = setTimeout(() => setJustArrived(false), 1800);
    return () => clearTimeout(timeout);
  }, [justArrived]);

  async function toggleRead(notification: OryCMSNotification, isRead: boolean) {
    setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead } : n)));
    setUnreadCount((count) => Math.max(0, count + (isRead ? -1 : 1)));
    try {
      await fetchJson(`/api/orycms/notifications/${notification.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });
    } catch {
      // Best-effort - local state already updated optimistically.
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetchJson("/api/orycms/notifications/read-all", { method: "POST" });
    } catch {
      // Best-effort.
    }
  }

  function openNotification(notification: OryCMSNotification) {
    if (!notification.isRead) void toggleRead(notification, true);
    setOpen(false);
    if (notification.link) router.push(notification.link);
  }

  const filtered = filter === "all" ? items : items.filter((n) => n.type === filter);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) load();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            justArrived && "notification-bell-ring",
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-[380px] p-0", justArrived && "notification-panel-glow")}
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12.5px] font-semibold">Notifications</div>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>
          <div className="mt-2 inline-flex items-center rounded-md border border-border bg-surface-muted p-0.5 text-[11px]">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "h-6 rounded-[5px] px-2 transition-colors",
                  filter === f.value
                    ? "bg-surface text-foreground shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[400px] space-y-1.5 overflow-y-auto p-2.5">
          {loading && (
            <div className="py-10 text-center text-[12px] text-muted-foreground">Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-10 text-center text-[12px] text-muted-foreground">
              {filter === "all" ? "No notifications yet." : "Nothing here yet."}
            </div>
          )}
          {!loading &&
            filtered.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/30",
                    n.isRead ? "bg-surface" : "bg-accent/20",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md",
                      meta.className,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn("text-[12.5px]", !n.isRead && "font-semibold")}>{n.title}</div>
                      {!n.isRead && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {n.body && (
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{n.body}</div>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                      {n.actorName && <span className="truncate">By {n.actorName}</span>}
                      <span>·</span>
                      <span className="shrink-0">{timeAgo(n.createdAt)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleRead(n, !n.isRead);
                        }}
                        className="ml-auto flex shrink-0 items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Check className="h-3 w-3" />
                        {n.isRead ? "Mark unread" : "Mark read"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
