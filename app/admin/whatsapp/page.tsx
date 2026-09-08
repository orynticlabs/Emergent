"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Check,
  ListTree,
  Loader2,
  Lock,
  MessageCircle,
  MessageSquare,
  Save,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * WhatsApp Automation - /admin/whatsapp. Step 9: pure UI. Every value here
 * comes from the settings routes Steps 2/3/5 already built
 * (/api/orycms/whatsapp/settings, /api/orycms/gemini/settings) plus the
 * generic generation endpoint Step 4 built (/api/orycms/ai/generate) - no
 * new backend route or table is introduced by this file. WhatsApp
 * credentials themselves (access token, phone number id, ...) are still
 * only editable at Plugins → Integrations → WhatsApp Business
 * (/admin/plugins/whatsapp-business); this page shows WhatsApp's status
 * read-only and owns the AI-automation half of the configuration
 * (systemInstruction, businessContext, autoReplyEnabled) that actually
 * drives Step 8's auto-reply flow.
 */

interface OryCMSWhatsAppSettingsSafe {
  provider: string;
  phoneNumberId: string | null;
  connected: boolean;
}

interface OryCMSGeminiSettingsSafe {
  apiKeyConfigured: boolean;
  connected: boolean;
  autoReplyEnabled: boolean;
  systemInstruction: string | null;
  businessContext: string | null;
}

interface OryCMSAIGenerateResult {
  success: boolean;
  provider: string;
  model: string | null;
  text: string | null;
  error: { code: string; message: string } | null;
}

const SYSTEM_INSTRUCTION_MAX_LENGTH = 8000;
const BUSINESS_CONTEXT_MAX_LENGTH = 4000;

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

function StatusPill({ connected, label }: { connected: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        connected ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {connected ? `${label} Connected` : `${label} Not Connected`}
    </span>
  );
}

export default function WhatsAppAutomationPage() {
  const { loaded } = useOryCMSSession();
  const canManage = useOryCMSPermission("whatsapp", "manage");

  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState<OryCMSWhatsAppSettingsSafe | null>(null);
  const [gemini, setGemini] = useState<OryCMSGeminiSettingsSafe | null>(null);

  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [saving, setSaving] = useState(false);

  const [testMessage, setTestMessage] = useState("Hi, what are your store hours?");
  const [testing, setTesting] = useState(false);
  const [testReply, setTestReply] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded || !canManage) return;
    let cancelled = false;

    Promise.all([
      fetchJson<{ settings: OryCMSWhatsAppSettingsSafe | null }>("/api/orycms/whatsapp/settings"),
      fetchJson<{ settings: OryCMSGeminiSettingsSafe | null }>("/api/orycms/gemini/settings"),
    ])
      .then(([whatsappRes, geminiRes]) => {
        if (cancelled) return;
        setWhatsapp(whatsappRes.settings);
        setGemini(geminiRes.settings);
        setAutoReplyEnabled(geminiRes.settings?.autoReplyEnabled ?? false);
        setSystemInstruction(geminiRes.settings?.systemInstruction ?? "");
        setBusinessContext(geminiRes.settings?.businessContext ?? "");
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Couldn't load WhatsApp automation settings", {
            description: err instanceof Error ? err.message : undefined,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loaded, canManage]);

  const systemInstructionValid = systemInstruction.length <= SYSTEM_INSTRUCTION_MAX_LENGTH;
  const businessContextValid = businessContext.length <= BUSINESS_CONTEXT_MAX_LENGTH;

  const handleSave = async () => {
    if (!systemInstructionValid || !businessContextValid) {
      toast.error("Instructions are too long", {
        description: `System Instructions must be ${SYSTEM_INSTRUCTION_MAX_LENGTH} characters or fewer; Business Context must be ${BUSINESS_CONTEXT_MAX_LENGTH} or fewer.`,
      });
      return;
    }

    setSaving(true);
    try {
      const method = gemini ? "PATCH" : "POST";
      const res = await fetchJson<{ settings: OryCMSGeminiSettingsSafe }>(
        "/api/orycms/gemini/settings",
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoReplyEnabled, systemInstruction, businessContext }),
        },
      );
      setGemini(res.settings);
      toast.success("WhatsApp automation settings saved");
    } catch (err) {
      toast.error("Couldn't save automation settings", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestReply = async () => {
    if (!testMessage.trim()) {
      toast.error("Enter a test message first");
      return;
    }

    setTesting(true);
    setTestReply(null);
    try {
      const result = await fetchJson<OryCMSAIGenerateResult>("/api/orycms/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: testMessage }),
      });
      if (result.success && result.text) {
        setTestReply(result.text);
        toast.success("AI reply generated");
      } else {
        toast.error("AI reply failed", { description: result.error?.message });
      }
    } catch (err) {
      toast.error("Couldn't generate a test reply", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setTesting(false);
    }
  };

  // Fail-closed while the session is still loading - same convention as
  // AppSidebar.tsx and the Payments/MFA Logs pages.
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
              WhatsApp automation controls how the AI replies to customers, so only Admin and
              Super Admin roles can view or change it.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell section="WhatsApp Automation">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[12px] text-muted-foreground">Platform / WhatsApp Automation</div>
            <h1 className="mt-1 text-[26px] font-semibold tracking-tight">WhatsApp Automation</h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Configure how Gemini AI auto-replies to incoming WhatsApp messages. Connection
              credentials are managed on their own integration pages - this page controls
              behavior only.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/whatsapp/inbox"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[12.5px] font-medium hover:border-border-strong transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Inbox
            </Link>
            <Link
              href="/admin/whatsapp/menu"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[12.5px] font-medium hover:border-border-strong transition-colors"
            >
              <ListTree className="h-3.5 w-3.5" />
              Menu Builder
            </Link>
          </div>
        </div>

        {loading ? (
          <Card className="flex items-center justify-center gap-2 p-10 text-[12.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading WhatsApp automation settings…
          </Card>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1.8fr_1fr]">
            <div className="space-y-5">
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">Connection status</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      Both WhatsApp and Gemini must be connected for auto-reply to work.
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/40 p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted text-foreground">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-medium">WhatsApp</div>
                        <div className="text-[11px] text-muted-foreground">
                          {whatsapp?.phoneNumberId ? `Phone: ${whatsapp.phoneNumberId}` : "Not configured"}
                        </div>
                      </div>
                    </div>
                    <StatusPill connected={Boolean(whatsapp?.connected)} label="WhatsApp" />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/40 p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted text-foreground">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-medium">Gemini</div>
                        <div className="text-[11px] text-muted-foreground">
                          {gemini?.apiKeyConfigured ? "API key configured" : "Not configured"}
                        </div>
                      </div>
                    </div>
                    <StatusPill connected={Boolean(gemini?.connected)} label="Gemini" />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">AI Instructions</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      How the AI should behave when it auto-replies to a customer.
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted/40 px-3 py-2">
                    <span className="text-[11.5px] font-medium">
                      AI Auto Reply:{" "}
                      <span className={autoReplyEnabled ? "text-success" : "text-muted-foreground"}>
                        {autoReplyEnabled ? "On" : "Off"}
                      </span>
                    </span>
                    <Switch checked={autoReplyEnabled} onCheckedChange={setAutoReplyEnabled} />
                  </div>
                </div>

                <div className="mt-5 space-y-1.5">
                  <span className="text-[11.5px] font-medium text-muted-foreground">
                    System Instructions
                  </span>
                  <Textarea
                    rows={5}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    placeholder="e.g. You are a customer support assistant for our business. Reply professionally and concisely. Use Hinglish when the customer uses Hinglish. Never invent pricing or policies."
                    className={cn(!systemInstructionValid && "border-destructive")}
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Sent as the AI's system instruction for every auto-reply.</span>
                    <span className={cn(!systemInstructionValid && "text-destructive")}>
                      {systemInstruction.length}/{SYSTEM_INSTRUCTION_MAX_LENGTH}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[11.5px] font-medium text-muted-foreground">
                    Business Context <span className="font-normal">(optional)</span>
                  </span>
                  <Textarea
                    rows={3}
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value)}
                    placeholder="Products, tone of voice, policies, or anything else the AI should know."
                    className={cn(!businessContextValid && "border-destructive")}
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Combined with System Instructions on every auto-reply.</span>
                    <span className={cn(!businessContextValid && "text-destructive")}>
                      {businessContext.length}/{BUSINESS_CONTEXT_MAX_LENGTH}
                    </span>
                  </div>
                </div>

                <Button className="mt-5" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save changes
                </Button>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="p-5">
                <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  Test AI Reply
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Sends a message straight to Gemini using your saved instructions - no WhatsApp
                  message is sent to a customer.
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[11.5px] font-medium text-muted-foreground">
                    Test message
                  </span>
                  <Input
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="What would a customer ask?"
                  />
                </div>

                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={handleTestReply}
                  disabled={testing || !gemini?.apiKeyConfigured}
                >
                  {testing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Test AI Reply
                </Button>
                {!gemini?.apiKeyConfigured && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Configure a Gemini API key at Plugins → Integrations → Gemini AI first.
                  </p>
                )}

                {testReply && (
                  <div className="mt-4 rounded-lg border border-border bg-surface-muted/40 p-3">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      AI reply
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground">
                      {testReply}
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-5">
                <div className="text-[13.5px] font-semibold">Ready to auto-reply</div>
                <div className="mt-4 space-y-2.5">
                  {[
                    { label: "WhatsApp connected", ok: Boolean(whatsapp?.connected) },
                    { label: "Gemini connected", ok: Boolean(gemini?.connected) },
                    { label: "Auto Reply on", ok: autoReplyEnabled },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[12px]">
                      <span
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded-full",
                          item.ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.ok && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
