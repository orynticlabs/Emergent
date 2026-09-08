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
 * Real WhatsApp Business connector settings - Settings → Integrations →
 * WhatsApp. Backed by app/api/orycms/whatsapp/settings/route.ts, which in
 * turn calls OryCMSWhatsAppService (encryption + persistence).
 *
 * Secret fields (accessToken, appSecret, verifyToken) are never returned by
 * the API, so they always start blank here - only a "configured" flag comes
 * back, rendered as placeholder text. Nothing in this file writes any
 * secret to localStorage/sessionStorage; the only place a typed secret
 * value lives is transient React state, cleared right after a successful
 * save.
 */

// Mirrors OryCMSWhatsAppProvider (orycms/whatsapp/whatsapp.types.ts) - kept
// as a plain literal list here since this is a client component and can't
// import server-only modules; the API route validates the real enum.
const PROVIDERS = [
  { value: "meta", label: "Meta Cloud API" },
  { value: "twilio", label: "Twilio" },
  { value: "360dialog", label: "360dialog" },
  { value: "gupshup", label: "Gupshup" },
  { value: "interakt", label: "Interakt" },
] as const;

interface OryCMSWhatsAppSettingsSafe {
  id: string;
  provider: string;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  appId: string | null;
  accessTokenConfigured: boolean;
  appSecretConfigured: boolean;
  verifyTokenConfigured: boolean;
  connected: boolean;
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

export function WhatsAppSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OryCMSWhatsAppSettingsSafe | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const [provider, setProvider] = useState("meta");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [appId, setAppId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [verifyToken, setVerifyToken] = useState("");

  const applySettings = (safe: OryCMSWhatsAppSettingsSafe | null) => {
    setSettings(safe);
    setProvider(safe?.provider ?? "meta");
    setPhoneNumberId(safe?.phoneNumberId ?? "");
    setBusinessAccountId(safe?.businessAccountId ?? "");
    setAppId(safe?.appId ?? "");
    // Secrets never come back from the API - always start blank.
    setAccessToken("");
    setAppSecret("");
    setVerifyToken("");
  };

  useEffect(() => {
    let cancelled = false;
    fetchJson<{ settings: OryCMSWhatsAppSettingsSafe | null }>("/api/orycms/whatsapp/settings")
      .then((res) => {
        if (!cancelled) applySettings(res.settings);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Couldn't load WhatsApp settings", {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!settings) {
        const res = await fetchJson<{ settings: OryCMSWhatsAppSettingsSafe }>(
          "/api/orycms/whatsapp/settings",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider,
              phoneNumberId: phoneNumberId || null,
              businessAccountId: businessAccountId || null,
              appId: appId || null,
              accessToken: accessToken || null,
              appSecret: appSecret || null,
              verifyToken: verifyToken || null,
            }),
          },
        );
        applySettings(res.settings);
        toast.success("WhatsApp connected");
      } else {
        // PATCH: blank secret fields are simply left out of the body, so
        // the route (and OryCMSWhatsAppService underneath) never overwrites
        // an already-stored secret with an empty value.
        const res = await fetchJson<{ settings: OryCMSWhatsAppSettingsSafe }>(
          "/api/orycms/whatsapp/settings",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider,
              phoneNumberId,
              businessAccountId,
              appId,
              ...(accessToken.trim() && { accessToken }),
              ...(appSecret.trim() && { appSecret }),
              ...(verifyToken.trim() && { verifyToken }),
            }),
          },
        );
        applySettings(res.settings);
        toast.success("WhatsApp settings saved");
      }
    } catch (err) {
      toast.error("Couldn't save WhatsApp settings", {
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
        "/api/orycms/whatsapp/settings/test-connection",
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
      await fetchJson("/api/orycms/whatsapp/settings", { method: "DELETE" });
      applySettings(null);
      toast.success("WhatsApp disconnected");
    } catch (err) {
      toast.error("Couldn't disconnect WhatsApp", {
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
        Loading WhatsApp settings…
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
              <div className="text-[13.5px] font-semibold">Connection</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Identify which WhatsApp Business account these credentials belong to.
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
            <Field label="Provider">
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone Number ID">
              <Input
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 109876543210123"
              />
            </Field>
            <Field label="Business Account ID">
              <Input
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                placeholder="e.g. 987654321098765"
              />
            </Field>
            <Field label="App ID">
              <Input
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g. 123456789012345"
              />
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13.5px] font-semibold">Secrets</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            Stored encrypted. Never shown again after saving - leave a field blank to keep its
            current value.
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              label="Access Token"
              hint={
                settings?.accessTokenConfigured
                  ? "Configured - leave blank to keep it"
                  : "Not set"
              }
            >
              <Input
                type="password"
                autoComplete="off"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={settings?.accessTokenConfigured ? "••••••••••••••••" : "Paste access token"}
              />
            </Field>
            <Field
              label="App Secret"
              hint={settings?.appSecretConfigured ? "Configured - leave blank to keep it" : "Not set"}
            >
              <Input
                type="password"
                autoComplete="off"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder={settings?.appSecretConfigured ? "••••••••••••••••" : "Paste app secret"}
              />
            </Field>
            <Field
              label="Verify Token"
              hint={
                settings?.verifyTokenConfigured ? "Configured - leave blank to keep it" : "Not set"
              }
            >
              <Input
                type="password"
                autoComplete="off"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder={settings?.verifyTokenConfigured ? "••••••••••••••••" : "Choose a verify token"}
              />
            </Field>
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
              disabled={testing || !settings}
            >
              {testing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Test Connection
            </Button>
          </div>
          {!settings && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Save a configuration before testing the connection.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <div className="text-[13.5px] font-semibold">Required fields</div>
          <div className="mt-4 space-y-2.5">
            {[
              { label: "Access token", ok: Boolean(settings?.accessTokenConfigured) },
              { label: "Phone Number ID", ok: Boolean(settings?.phoneNumberId) },
              { label: "Business Account ID", ok: Boolean(settings?.businessAccountId) },
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

        {settings && (
          <Card className="border-destructive/30 p-5">
            <div className="text-[13.5px] font-semibold">Danger zone</div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              Removes the saved configuration, including all secrets.
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
            <DialogTitle>Disconnect WhatsApp?</DialogTitle>
            <DialogDescription>
              This removes the saved provider, phone number, and encrypted secrets. You&apos;ll
              need to re-enter them to reconnect.
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
