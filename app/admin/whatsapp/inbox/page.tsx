"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Bot,
  ChevronRight,
  Loader2,
  Lock,
  MessageCircle,
  Send,
  User,
  UserCog,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * WhatsApp Inbox — /admin/whatsapp/inbox. Reads from
 * /api/orycms/whatsapp/inbox (list) and /api/orycms/whatsapp/inbox/:customerId
 * (detail), both backed by orycms_whatsapp_messages — the storage
 * whatsapp.ai-automation.service.ts now writes to for every inbound
 * customer message and every message it actually sends (AI, menu, or a
 * manual admin reply via this page). Manual replies go through
 * POST /api/orycms/whatsapp/inbox/:customerId/reply, which is gated on
 * "whatsapp":"manage" exactly like every other WhatsApp mutation — no RBAC
 * bypass for admin-initiated sends.
 */

const REFRESH_INTERVAL_MS = 5000;

type OryCMSWhatsAppMessageSender = "customer" | "ai" | "menu" | "admin";
type OryCMSWhatsAppMessageDirection = "inbound" | "outbound";
type OryCMSWhatsAppConversationMode = "ai" | "human";

interface OryCMSWhatsAppMessageRecord {
  id: string;
  customerId: string;
  contactName: string | null;
  direction: OryCMSWhatsAppMessageDirection;
  sender: OryCMSWhatsAppMessageSender;
  text: string;
  createdAt: string;
}

interface OryCMSWhatsAppConversationSummary {
  customerId: string;
  contactName: string | null;
  lastMessage: {
    text: string;
    sender: OryCMSWhatsAppMessageSender;
    direction: OryCMSWhatsAppMessageDirection;
    createdAt: string;
  };
  messageCount: number;
}

interface OryCMSWhatsAppConversationDetail {
  customerId: string;
  contactName: string | null;
  awaitingMenuSelection: boolean;
  mode: OryCMSWhatsAppConversationMode;
  messages: OryCMSWhatsAppMessageRecord[];
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

function initials(name: string | null, customerId: string): string {
  const source = name?.trim() || customerId;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const SENDER_LABEL: Record<OryCMSWhatsAppMessageSender, string> = {
  customer: "Customer",
  ai: "AI reply",
  menu: "Menu",
  admin: "You",
};

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function timeOfDay(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function MessageBubble({ message }: { message: OryCMSWhatsAppMessageRecord }) {
  const isCustomer = message.sender === "customer";
  const bubbleStyle = {
    customer: "bg-surface-muted text-foreground",
    ai: "bg-violet-600 text-white",
    menu: "border border-border bg-surface text-foreground",
    admin: "bg-foreground text-background",
  }[message.sender];

  return (
    <div className={cn("flex", isCustomer ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[75%] space-y-1", isCustomer ? "items-start" : "items-end")}>
        <div className={cn("flex items-center gap-1.5 text-[10.5px] text-muted-foreground", !isCustomer && "justify-end")}>
          {message.sender === "ai" && <Bot className="h-3 w-3" />}
          <span>{SENDER_LABEL[message.sender]}</span>
          <span>·</span>
          <span>{timeOfDay(message.createdAt)}</span>
        </div>
        <div className={cn("whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", bubbleStyle)}>
          {message.text}
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppInboxPage() {
  const { loaded } = useOryCMSSession();
  const canManage = useOryCMSPermission("whatsapp", "manage");

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<OryCMSWhatsAppConversationSummary[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<OryCMSWhatsAppConversationDetail | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedCustomerIdRef = useRef<string | null>(null);
  selectedCustomerIdRef.current = selectedCustomerId;

  const loadConversations = () =>
    fetchJson<{ conversations: OryCMSWhatsAppConversationSummary[] }>("/api/orycms/whatsapp/inbox")
      .then((res) => setConversations(res.conversations))
      .catch((err) => {
        toast.error("Couldn't load conversations", {
          description: err instanceof Error ? err.message : undefined,
        });
      });

  const loadConversation = (customerId: string) =>
    fetchJson<{ conversation: OryCMSWhatsAppConversationDetail }>(
      `/api/orycms/whatsapp/inbox/${encodeURIComponent(customerId)}`,
    )
      .then((res) => {
        if (selectedCustomerIdRef.current === customerId) setConversation(res.conversation);
      })
      .catch((err) => {
        toast.error("Couldn't load conversation", {
          description: err instanceof Error ? err.message : undefined,
        });
      });

  // Initial load + auto-refresh every few seconds.
  useEffect(() => {
    if (!loaded || !canManage) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      loadConversations();
      if (selectedCustomerIdRef.current) loadConversation(selectedCustomerIdRef.current);
    };

    tick();
    setLoading(false);
    const interval = setInterval(tick, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, canManage]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setConversation(null);
      return;
    }
    loadConversation(selectedCustomerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [conversation?.messages.length]);

  const handleSend = async () => {
    if (!selectedCustomerId || !replyText.trim()) return;
    setSending(true);
    try {
      const result = await fetchJson<{ success: boolean; error: { message: string } | null }>(
        `/api/orycms/whatsapp/inbox/${encodeURIComponent(selectedCustomerId)}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: replyText }),
        },
      );
      if (result.success) {
        setReplyText("");
        toast.success("Reply sent");
        await loadConversation(selectedCustomerId);
        await loadConversations();
      } else {
        toast.error("Couldn't send reply", { description: result.error?.message });
      }
    } catch (err) {
      toast.error("Couldn't send reply", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSending(false);
    }
  };

  const handleToggleMode = async (nextMode: OryCMSWhatsAppConversationMode) => {
    if (!selectedCustomerId) return;
    setTogglingMode(true);
    try {
      await fetchJson(`/api/orycms/whatsapp/inbox/${encodeURIComponent(selectedCustomerId)}/mode`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      });
      toast.success(nextMode === "human" ? "Took over — AI paused for this customer" : "Resumed AI for this customer");
      await loadConversation(selectedCustomerId);
    } catch (err) {
      toast.error("Couldn't change conversation mode", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setTogglingMode(false);
    }
  };

  if (!loaded) return null;

  if (!canManage) {
    return (
      <AppShell section="WhatsApp Automation">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface/30 px-8 py-16 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-[13.5px] font-medium">Restricted to Admin and Super Admin</div>
            <p className="max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              The inbox holds real customer conversations, so only Admin and Super Admin roles
              can view or reply to it.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell section="WhatsApp Automation">
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[1400px] flex-col gap-4 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link href="/admin/whatsapp" className="hover:text-foreground">
            WhatsApp Automation
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Inbox</span>
        </div>

        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">WhatsApp Inbox</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Every customer message and reply — automated or manual. Refreshes automatically every
            few seconds.
          </p>
        </div>

        {loading ? (
          <Card className="flex flex-1 items-center justify-center gap-2 p-10 text-[12.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading inbox…
          </Card>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
            <Card className="flex min-h-0 flex-col overflow-hidden">
              <div className="border-b border-border p-4">
                <div className="text-[13px] font-semibold">
                  Conversations
                  <span className="ml-1.5 text-[11.5px] font-normal text-muted-foreground">
                    ({conversations.length})
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                  <div className="p-6 text-center text-[12px] text-muted-foreground">
                    No conversations yet — once a customer messages your WhatsApp number, it'll
                    show up here.
                  </div>
                )}
                {conversations.map((convo) => (
                  <button
                    key={convo.customerId}
                    onClick={() => setSelectedCustomerId(convo.customerId)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border p-3.5 text-left transition-colors hover:bg-surface-muted/60",
                      selectedCustomerId === convo.customerId && "bg-surface-muted",
                    )}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-muted text-[11px] font-semibold text-foreground">
                      {initials(convo.contactName, convo.customerId)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12.5px] font-medium">
                          {convo.contactName || convo.customerId}
                        </span>
                        <span className="shrink-0 text-[10.5px] text-muted-foreground">
                          {relativeTime(convo.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                        {convo.lastMessage.direction === "outbound" ? "↪ " : ""}
                        {convo.lastMessage.text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="flex min-h-0 flex-col overflow-hidden">
              {!conversation ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center text-[12.5px] text-muted-foreground">
                  <MessageCircle className="h-6 w-6" />
                  Select a conversation to view its timeline.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold">
                          {conversation.contactName || conversation.customerId}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {conversation.customerId}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                          conversation.awaitingMenuSelection
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {conversation.awaitingMenuSelection
                          ? "Awaiting menu selection"
                          : "Not in a menu flow"}
                      </span>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                          conversation.mode === "human"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-success/10 text-success",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {conversation.mode === "human" ? "Human Active" : "AI Active"}
                      </span>

                      {conversation.mode === "human" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleMode("ai")}
                          disabled={togglingMode}
                        >
                          {togglingMode ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <Bot className="mr-1.5 h-3 w-3" />
                          )}
                          Resume AI
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleMode("human")}
                          disabled={togglingMode}
                        >
                          {togglingMode ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <UserCog className="mr-1.5 h-3 w-3" />
                          )}
                          Take Over
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {conversation.messages.length === 0 ? (
                      <div className="p-6 text-center text-[12px] text-muted-foreground">
                        No messages yet.
                      </div>
                    ) : (
                      conversation.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-border p-3">
                    <div className="flex items-end gap-2">
                      <Textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a manual reply…"
                        className="flex-1 resize-none"
                      />
                      <Button onClick={handleSend} disabled={sending || !replyText.trim()}>
                        {sending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
