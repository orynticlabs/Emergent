"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, PlugZap, ShieldCheck, Unplug } from "lucide-react";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Real Gemini AI plugin settings - Plugins → Gemini AI. Backed by
 * app/api/orycms/gemini/settings/route.ts, which calls OryCMSGeminiService
 * (encryption + persistence). Independent of the WhatsApp panel
 * (_whatsapp-settings.tsx) - this file imports nothing from orycms/whatsapp
 * and nothing here assumes a messaging channel exists.
 *
 * The API key is never returned by the API, so it always starts blank here
 * - only a "configured" flag comes back, rendered as placeholder text.
 * Nothing in this file writes any secret to localStorage/sessionStorage;
 * the only place a typed key lives is transient React state, cleared right
 * after a successful save.
 */

// Mirrors ORYCMS_GEMINI_MODELS (orycms/gemini/gemini.types.ts) - kept as a
// plain literal list here since this is a client component; the API route
// accepts any non-empty model string, this is just the suggested set.
const MODELS = [
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-flash-lite-latest",
] as const;

const TEMPERATURE_MIN = 0;
const TEMPERATURE_MAX = 2;
const MAX_OUTPUT_TOKENS_MIN = 1;
const MAX_OUTPUT_TOKENS_MAX = 8192;
// Mirrors ORYCMS_GEMINI_SYSTEM_INSTRUCTION_MAX_LENGTH / _BUSINESS_CONTEXT_MAX_LENGTH
// (orycms/gemini/gemini.types.ts) - kept as plain literals here for the same
// reason MODELS above is: this is a client component, gemini.types.ts is
// server-safe but duplicating two numbers is simpler than a deep import.
const SYSTEM_INSTRUCTION_MAX_LENGTH = 8000;
const BUSINESS_CONTEXT_MAX_LENGTH = 4000;

interface OryCMSGeminiSettingsSafe {
  id: string;
  enabled: boolean;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  apiKeyConfigured: boolean;
  connected: boolean;
  systemInstruction: string | null;
  businessContext: string | null;
  autoReplyEnabled: boolean;
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11.5px] font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function GeminiSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OryCMSGeminiSettingsSafe | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [model, setModel] = useState<string>(MODELS[0]);
  const [temperature, setTemperature] = useState("0.7");
  const [maxOutputTokens, setMaxOutputTokens] = useState("2048");
  const [apiKey, setApiKey] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);

  const applySettings = (safe: OryCMSGeminiSettingsSafe | null) => {
    setSettings(safe);
    setEnabled(safe?.enabled ?? false);
    setModel(safe?.model ?? MODELS[0]);
    setTemperature(String(safe?.temperature ?? 0.7));
    setMaxOutputTokens(String(safe?.maxOutputTokens ?? 2048));
    setSystemInstruction(safe?.systemInstruction ?? "");
    setBusinessContext(safe?.businessContext ?? "");
    setAutoReplyEnabled(safe?.autoReplyEnabled ?? false);
    // The API key never comes back from the API - always start blank.
    setApiKey("");
  };

  useEffect(() => {
    let cancelled = false;
    fetchJson<{ settings: OryCMSGeminiSettingsSafe | null }>("/api/orycms/gemini/settings")
      .then((res) => {
        if (!cancelled) applySettings(res.settings);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Couldn't load Gemini settings", {
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
  }, []);

  const parsedTemperature = Number(temperature);
  const parsedMaxOutputTokens = Number(maxOutputTokens);
  const temperatureValid =
    Number.isFinite(parsedTemperature) &&
    parsedTemperature >= TEMPERATURE_MIN &&
    parsedTemperature <= TEMPERATURE_MAX;
  const maxOutputTokensValid =
    Number.isInteger(parsedMaxOutputTokens) &&
    parsedMaxOutputTokens >= MAX_OUTPUT_TOKENS_MIN &&
    parsedMaxOutputTokens <= MAX_OUTPUT_TOKENS_MAX;
  const systemInstructionValid = systemInstruction.length <= SYSTEM_INSTRUCTION_MAX_LENGTH;
  const businessContextValid = businessContext.length <= BUSINESS_CONTEXT_MAX_LENGTH;

  const handleSave = async () => {
    if (!temperatureValid || !maxOutputTokensValid) {
      toast.error("Check temperature and max output tokens", {
        description: `Temperature must be ${TEMPERATURE_MIN}–${TEMPERATURE_MAX}; max output tokens must be a whole number ${MAX_OUTPUT_TOKENS_MIN}–${MAX_OUTPUT_TOKENS_MAX}.`,
      });
      return;
    }
    if (!systemInstructionValid || !businessContextValid) {
      toast.error("Instructions are too long", {
        description: `System Instructions must be ${SYSTEM_INSTRUCTION_MAX_LENGTH} characters or fewer; Business Context must be ${BUSINESS_CONTEXT_MAX_LENGTH} or fewer.`,
      });
      return;
    }

    setSaving(true);
    try {
      if (!settings) {
        const res = await fetchJson<{ settings: OryCMSGeminiSettingsSafe }>(
          "/api/orycms/gemini/settings",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enabled,
              model,
              temperature: parsedTemperature,
              maxOutputTokens: parsedMaxOutputTokens,
              apiKey: apiKey || null,
              systemInstruction: systemInstruction || null,
              businessContext: businessContext || null,
              autoReplyEnabled,
            }),
          },
        );
        applySettings(res.settings);
        toast.success("Gemini AI connected");
      } else {
        // PATCH: a blank API key is simply left out of the body, so the
        // route (and OryCMSGeminiService underneath) never overwrites an
        // already-stored key with an empty value. systemInstruction and
        // businessContext are always sent (even blank) since, unlike the
        // key, they aren't secrets - an empty value here is a deliberate
        // "clear this field" rather than "leave it alone".
        const res = await fetchJson<{ settings: OryCMSGeminiSettingsSafe }>(
          "/api/orycms/gemini/settings",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enabled,
              model,
              temperature: parsedTemperature,
              maxOutputTokens: parsedMaxOutputTokens,
              systemInstruction,
              businessContext,
              autoReplyEnabled,
              ...(apiKey.trim() && { apiKey }),
            }),
          },
        );
        applySettings(res.settings);
        toast.success("Gemini settings saved");
      }
    } catch (err) {
      toast.error("Couldn't save Gemini settings", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await fetchJson<{ ok: boolean; code: string; message: string }>(
        "/api/orycms/gemini/settings/test-connection",
        { method: "POST" },
      );
      if (result.ok) {
        toast.success("Connection check passed", { description: result.message });
      } else {
        toast.info("Connection not ready", { description: result.message });
      }
    } catch (err) {
      toast.error("Test connection failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetchJson("/api/orycms/gemini/settings", { method: "DELETE" });
      applySettings(null);
      toast.success("Gemini AI disconnected");
    } catch (err) {
      toast.error("Couldn't disconnect Gemini AI", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDisconnecting(false);
      setConfirmDisconnect(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center gap-2 p-10 text-[12.5px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Gemini settings…
      </Card>
    );
  }

  const isConnected = settings?.connected ?? false;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.8fr_1fr]">
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[13.5px] font-semibold">Configuration</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                API key, model, and generation defaults for the Gemini plugin.
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                isConnected ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Model">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="API Key"
              hint={settings?.apiKeyConfigured ? "Configured - leave blank to keep it" : "Not set"}
            >
              <Input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings?.apiKeyConfigured ? "••••••••••••••••" : "Paste Gemini API key"}
              />
            </Field>
            <Field
              label="Temperature"
              hint={`${TEMPERATURE_MIN}–${TEMPERATURE_MAX}, higher is more creative`}
            >
              <Input
                type="number"
                min={TEMPERATURE_MIN}
                max={TEMPERATURE_MAX}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className={cn(!temperatureValid && "border-destructive")}
              />
            </Field>
            <Field
              label="Max Output Tokens"
              hint={`${MAX_OUTPUT_TOKENS_MIN}–${MAX_OUTPUT_TOKENS_MAX}`}
            >
              <Input
                type="number"
                min={MAX_OUTPUT_TOKENS_MIN}
                max={MAX_OUTPUT_TOKENS_MAX}
                step={1}
                value={maxOutputTokens}
                onChange={(e) => setMaxOutputTokens(e.target.value)}
                className={cn(!maxOutputTokensValid && "border-destructive")}
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/40 p-4">
            <div>
              <div className="text-[12.5px] font-medium">Enabled</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Turns the plugin on for other OryCMS modules to call. Independent of the fields
                above being saved.
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13.5px] font-semibold">AI Instructions & Automation</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            How the AI should behave when it's asked to generate a response. Not connected to
            WhatsApp or any messaging channel yet - this only configures the instruction the
            Gemini plugin uses.
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] font-medium text-muted-foreground">
                System Instructions
              </span>
              {systemInstruction && (
                <button
                  type="button"
                  onClick={() => setSystemInstruction("")}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <Textarea
              rows={5}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="e.g. You are a customer support assistant for our business. Reply professionally and concisely. Use Hinglish when the customer uses Hinglish. Never invent pricing or policies."
              className={cn(!systemInstructionValid && "border-destructive")}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Sent as the AI's system instruction on every generation call, unless a caller overrides it.</span>
              <span className={cn(!systemInstructionValid && "text-destructive")}>
                {systemInstruction.length}/{SYSTEM_INSTRUCTION_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] font-medium text-muted-foreground">
                Business Context <span className="font-normal">(optional)</span>
              </span>
              {businessContext && (
                <button
                  type="button"
                  onClick={() => setBusinessContext("")}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <Textarea
              rows={3}
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              placeholder="Products, tone of voice, policies, or anything else worth recording alongside the instructions above."
              className={cn(!businessContextValid && "border-destructive")}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Stored for reference only - not sent to Gemini automatically in this step.</span>
              <span className={cn(!businessContextValid && "text-destructive")}>
                {businessContext.length}/{BUSINESS_CONTEXT_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/40 p-4">
            <div>
              <div className="text-[12.5px] font-medium">Auto Reply</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Reserved for a future automated-reply feature (e.g. WhatsApp) to check before
                acting - this plugin doesn't act on it by itself yet.
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                Currently:{" "}
                <span className={cn("font-medium", autoReplyEnabled ? "text-success" : "text-foreground")}>
                  {autoReplyEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            <Switch checked={autoReplyEnabled} onCheckedChange={setAutoReplyEnabled} />
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[13.5px] font-semibold">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Actions
          </div>
          <div className="mt-4 space-y-2.5">
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <PlugZap className="mr-1.5 h-3.5 w-3.5" />
              )}
              {settings ? "Save changes" : "Save & connect"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleTestConnection}
              disabled={testing || !settings?.apiKeyConfigured}
            >
              {testing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Test Connection
            </Button>
          </div>
          {!settings?.apiKeyConfigured && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Save an API key before testing the connection.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <div className="text-[13.5px] font-semibold">Required fields</div>
          <div className="mt-4 space-y-2.5">
            {[{ label: "API key", ok: Boolean(settings?.apiKeyConfigured) }].map((item) => (
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

        {settings && (
          <Card className="border-destructive/30 p-5">
            <div className="text-[13.5px] font-semibold">Danger zone</div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              Removes the saved configuration, including the API key.
            </div>
            <Button
              variant="destructive"
              className="mt-4 w-full"
              onClick={() => setConfirmDisconnect(true)}
            >
              <Unplug className="mr-1.5 h-3.5 w-3.5" />
              Disconnect
            </Button>
          </Card>
        )}
      </div>

      <Dialog open={confirmDisconnect} onOpenChange={setConfirmDisconnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Gemini AI?</DialogTitle>
            <DialogDescription>
              This removes the saved model, generation defaults, and encrypted API key.
              You&apos;ll need to re-enter them to reconnect.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDisconnect(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
