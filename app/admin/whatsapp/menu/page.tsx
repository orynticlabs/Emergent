"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, ListPlus, Loader2, Lock, Save, Trash2 } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * WhatsApp Menu Builder - /admin/whatsapp/menu. Step 10: configuration
 * only, via the existing GET/PATCH /api/orycms/whatsapp/menu route (Step
 * 10's own new API - no other backend route is touched). Nothing here is
 * wired to the webhook, numbered-reply routing, or AI replies yet - saving
 * a menu here has no runtime effect until a later step reads it.
 */

const OPTION_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const MAX_OPTIONS = 9;
const TITLE_MAX_LENGTH = 100;
const AI_INSTRUCTIONS_MAX_LENGTH = 2000;
const WELCOME_MESSAGE_MAX_LENGTH = 1000;

interface OryCMSWhatsAppMenuOptionRecord {
  id: string;
  number: number;
  title: string;
  aiInstructions: string | null;
}

interface OryCMSWhatsAppMenuSettings {
  enabled: boolean;
  welcomeMessage: string | null;
  options: OryCMSWhatsAppMenuOptionRecord[];
}

/** Local editable row - `key` is a stable React key independent of the server id (new rows don't have one yet). */
interface EditableOption {
  key: string;
  number: number;
  title: string;
  aiInstructions: string;
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

function nextAvailableNumber(options: EditableOption[]): number {
  const used = new Set(options.map((o) => o.number));
  for (const n of OPTION_NUMBERS) if (!used.has(n)) return n;
  return OPTION_NUMBERS[OPTION_NUMBERS.length - 1];
}

function toEditable(records: OryCMSWhatsAppMenuOptionRecord[]): EditableOption[] {
  return records
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((option) => ({
      key: option.id,
      number: option.number,
      title: option.title,
      aiInstructions: option.aiInstructions ?? "",
    }));
}

export default function WhatsAppMenuBuilderPage() {
  const { loaded } = useOryCMSSession();
  const canManage = useOryCMSPermission("whatsapp", "manage");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [options, setOptions] = useState<EditableOption[]>([]);

  useEffect(() => {
    if (!loaded || !canManage) return;
    let cancelled = false;

    fetchJson<{ menu: OryCMSWhatsAppMenuSettings }>("/api/orycms/whatsapp/menu")
      .then((res) => {
        if (cancelled) return;
        setEnabled(res.menu.enabled);
        setWelcomeMessage(res.menu.welcomeMessage ?? "");
        setOptions(toEditable(res.menu.options));
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Couldn't load the WhatsApp menu", {
            description: err instanceof Error ? err.message : undefined,
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadedOnce(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loaded, canManage]);

  const welcomeMessageValid = welcomeMessage.length <= WELCOME_MESSAGE_MAX_LENGTH;

  const handleAddOption = () => {
    if (options.length >= MAX_OPTIONS) {
      toast.error(`A menu can have at most ${MAX_OPTIONS} options.`);
      return;
    }
    setOptions((prev) => [
      ...prev,
      { key: crypto.randomUUID(), number: nextAvailableNumber(prev), title: "", aiInstructions: "" },
    ]);
  };

  const handleRemoveOption = (key: string) => {
    setOptions((prev) => prev.filter((o) => o.key !== key));
  };

  const updateOption = (key: string, patch: Partial<EditableOption>) => {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));
  };

  const validateBeforeSave = (): string | null => {
    if (!welcomeMessageValid) {
      return `Welcome message must be ${WELCOME_MESSAGE_MAX_LENGTH} characters or fewer.`;
    }
    if (options.length > MAX_OPTIONS) {
      return `A menu can have at most ${MAX_OPTIONS} options.`;
    }
    const seen = new Set<number>();
    for (const option of options) {
      if (seen.has(option.number)) return `Option number ${option.number} is used more than once.`;
      seen.add(option.number);
      if (!option.title.trim()) return `Option ${option.number} needs a title.`;
      if (option.title.length > TITLE_MAX_LENGTH) {
        return `Option ${option.number}'s title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
      }
      if (option.aiInstructions.length > AI_INSTRUCTIONS_MAX_LENGTH) {
        return `Option ${option.number}'s AI Instructions must be ${AI_INSTRUCTIONS_MAX_LENGTH} characters or fewer.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationMessage = validateBeforeSave();
    if (validationMessage) {
      toast.error("Check your menu before saving", { description: validationMessage });
      return;
    }

    setSaving(true);
    try {
      const res = await fetchJson<{ menu: OryCMSWhatsAppMenuSettings }>(
        "/api/orycms/whatsapp/menu",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled,
            welcomeMessage,
            options: options.map((o) => ({
              number: o.number,
              title: o.title,
              aiInstructions: o.aiInstructions || null,
            })),
          }),
        },
      );
      setEnabled(res.menu.enabled);
      setWelcomeMessage(res.menu.welcomeMessage ?? "");
      setOptions(toEditable(res.menu.options));
      toast.success("Menu saved");
    } catch (err) {
      toast.error("Couldn't save the menu", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
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
              The WhatsApp menu shapes automated customer replies, so only Admin and Super Admin
              roles can view or change it.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell section="WhatsApp Automation">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link href="/admin/whatsapp" className="hover:text-foreground">
            WhatsApp Automation
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Menu</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight">WhatsApp Menu Builder</h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Define a numbered menu customers can choose from. Not connected to the webhook or
              any reply flow yet - this only saves configuration.
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="flex items-center justify-center gap-2 p-10 text-[12.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading menu…
          </Card>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-semibold">Menu</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Turn the menu on and set what customers see first.
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted/40 px-3 py-2">
                  <span className="text-[11.5px] font-medium">
                    Menu:{" "}
                    <span className={enabled ? "text-success" : "text-muted-foreground"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </span>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <span className="text-[11.5px] font-medium text-muted-foreground">
                  Welcome message
                </span>
                <Textarea
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="e.g. Hi! 👋 How can we help you today? Reply with a number:"
                  className={cn(!welcomeMessageValid && "border-destructive")}
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Sent before the numbered list of options.</span>
                  <span className={cn(!welcomeMessageValid && "text-destructive")}>
                    {welcomeMessage.length}/{WELCOME_MESSAGE_MAX_LENGTH}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-semibold">Options</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Up to {MAX_OPTIONS} numbered options, each with its own AI instructions.
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddOption}
                  disabled={options.length >= MAX_OPTIONS}
                >
                  <ListPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add option
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {options.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
                    No options yet - add one to start building the menu.
                  </div>
                )}

                {options.map((option) => (
                  <div key={option.key} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="w-20 shrink-0 space-y-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Number
                        </span>
                        <Select
                          value={String(option.number)}
                          onValueChange={(value) =>
                            updateOption(option.key, { number: Number(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPTION_NUMBERS.map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="min-w-[200px] flex-1 space-y-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Title
                        </span>
                        <Input
                          value={option.title}
                          onChange={(e) => updateOption(option.key, { title: e.target.value })}
                          placeholder="e.g. Talk to Sales"
                          maxLength={TITLE_MAX_LENGTH}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-5 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveOption(option.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        AI Instructions
                      </span>
                      <Textarea
                        rows={2}
                        value={option.aiInstructions}
                        onChange={(e) =>
                          updateOption(option.key, { aiInstructions: e.target.value })
                        }
                        placeholder="What should the AI do when a customer picks this option?"
                      />
                      <div className="text-right text-[11px] text-muted-foreground">
                        {option.aiInstructions.length}/{AI_INSTRUCTIONS_MAX_LENGTH}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-5" onClick={handleSave} disabled={saving || !loadedOnce}>
                {saving ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save changes
              </Button>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
