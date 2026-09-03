"use client";

import Link from "next/link";
import { use, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronRight, Clock3, PlugZap, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BrandMark } from "../_components";
import { getIntegration, STATUS_LABEL, STATUS_TINT, type IntegrationStatus } from "../_data";
import { useIntegrationStatus } from "../_storage";
import { WhatsAppSettingsPanel } from "../_whatsapp-settings";
import { GeminiSettingsPanel } from "../_gemini-settings";

// Integrations with a real, working backend (see
// app/api/orycms/whatsapp/settings/route.ts and
// app/api/orycms/gemini/settings/route.ts) — every other card in _data.ts
// still uses the mock connect flow below. The two are independent modules;
// this page just happens to host both detail views.
const WHATSAPP_SLUG = "whatsapp-business";
const GEMINI_SLUG = "gemini-ai";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

const DUMMY_PLATFORM_ORIGIN = "/dummy-platform";

function ConnectDialog({
  open,
  onOpenChange,
  name,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onConnect: () => void;
}) {
  const [apiKey, setApiKey] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {name}</DialogTitle>
          <DialogDescription>
            This is a mock connector — enter any value to simulate pairing an API key.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <span className="text-[11.5px] font-medium text-muted-foreground">API key</span>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`sk_live_${name.toLowerCase().replace(/\s+/g, "_")}_xxxxxxxx`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!apiKey.trim()}
            onClick={() => {
              onConnect();
              onOpenChange(false);
              setApiKey("");
            }}
          >
            Save and connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationDetail({ slug }: { slug: string }) {
  const integration = getIntegration(slug);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useIntegrationStatus(slug, integration?.defaultStatus ?? "not_connected");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  useEffect(() => {
    if (!integration?.live) return;
    const connected = searchParams.get("connected");
    const denied = searchParams.get("denied");
    if (connected === "1") {
      setStatus("connected");
      toast.success(`${integration.name} connected`, {
        description: "Dummy Platform granted the requested scopes to OryCMS.",
      });
      router.replace(`/admin/plugins/${slug}`);
    } else if (denied === "1") {
      toast.error("Connection request denied", {
        description: `You declined the authorization request from ${integration.name}.`,
      });
      router.replace(`/admin/plugins/${slug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!integration) {
    return (
      <AppShell section="Integrations">
        <PlaceholderPage
          eyebrow="Integration detail"
          title="Integration not found"
          description={`No integration is registered with the slug "${slug}".`}
        />
      </AppShell>
    );
  }

  const isConnected = status === "connected";

  const handleConnectClick = () => {
    if (integration.live) {
      const redirectUri = `${window.location.origin}/admin/plugins/${integration.slug}`;
      const params = new URLSearchParams({
        client_id: "orycms",
        client_name: "OryCMS",
        redirect_uri: redirectUri,
        scope: integration.scopes.join("|"),
      });
      router.push(`${DUMMY_PLATFORM_ORIGIN}/authorize?${params.toString()}`);
      return;
    }
    setDialogOpen(true);
  };

  const handleDisconnect = () => {
    setStatus("not_connected");
    setConfirmDisconnect(false);
    toast.success(`${integration.name} disconnected`);
  };

  return (
    <AppShell section="Integrations">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link href="/admin/plugins" className="hover:text-foreground">
            Integrations
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{integration.name}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <BrandMark logo={integration.logo} className="h-12 w-12 shrink-0 rounded-xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-semibold tracking-tight">{integration.name}</h1>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[11px] font-medium",
                    STATUS_TINT[status],
                  )}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
              <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                {integration.vendor} · {integration.category}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button variant="outline" onClick={() => setConfirmDisconnect(true)}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnectClick}>
                <PlugZap className="mr-1.5 h-3.5 w-3.5" />
                {integration.live ? "Connect via Dummy Platform" : "Connect"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-5">
            <Card className="p-5">
              <div className="text-[13.5px] font-semibold">Overview</div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                {integration.longDescription}
              </p>
            </Card>

            {isConnected && (
              <Card className="p-5">
                <div className="text-[13.5px] font-semibold">Configuration</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Connection details used to sync {integration.name} with OryCMS.
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[11.5px] font-medium text-muted-foreground">
                      Connection token
                    </span>
                    <Input readOnly value={`orycms_${integration.slug}_live_••••••••••••`} />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[11.5px] font-medium text-muted-foreground">
                      Webhook URL
                    </span>
                    <Input
                      readOnly
                      value={`https://admin.orycms.in/api/orycms/webhooks/${integration.slug}`}
                    />
                  </label>
                </div>
              </Card>
            )}

            <Card className="p-5">
              <div className="text-[13.5px] font-semibold">Activity</div>
              <div className="mt-4 space-y-3">
                {isConnected ? (
                  [
                    { label: "Connection established", time: "just now" },
                    { label: "Initial scope grant confirmed", time: "just now" },
                  ].map((event) => (
                    <div key={event.label} className="flex items-center gap-3 text-[12.5px]">
                      <div className="grid h-7 w-7 place-items-center rounded-md bg-success/10 text-success">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="flex-1">{event.label}</span>
                      <span className="text-[11px] text-muted-foreground">{event.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 text-[12.5px] text-muted-foreground">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-surface-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                    </div>
                    No activity yet — connect {integration.name} to start syncing.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Requested access
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Scopes OryCMS requests when connecting to {integration.name}.
              </div>
              <div className="mt-4 space-y-2.5">
                {integration.scopes.map((scope) => (
                  <div key={scope} className="flex items-start gap-2 text-[12px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span className="text-muted-foreground">{scope}</span>
                  </div>
                ))}
              </div>
            </Card>

            {isConnected && (
              <Card className="border-destructive/30 p-5">
                <div className="text-[13.5px] font-semibold">Danger zone</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Revoke access and stop syncing with {integration.name}.
                </div>
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() => setConfirmDisconnect(true)}
                >
                  Disconnect {integration.name}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConnectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        name={integration.name}
        onConnect={() => {
          setStatus("connected");
          toast.success(`${integration.name} connected`);
        }}
      />

      <Dialog open={confirmDisconnect} onOpenChange={setConfirmDisconnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {integration.name}?</DialogTitle>
            <DialogDescription>
              OryCMS will stop syncing with {integration.name} until you reconnect it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDisconnect(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/** Shared header (breadcrumb + brand mark + name) for a slug backed by a real panel, instead of the generic mock-connect flow below. */
function RealIntegrationDetail({ slug, panel }: { slug: string; panel: React.ReactNode }) {
  const integration = getIntegration(slug);
  if (!integration) return null; // unreachable — every real slug is always in _data.ts

  return (
    <AppShell section="Integrations">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link href="/admin/plugins" className="hover:text-foreground">
            Integrations
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{integration.name}</span>
        </div>

        <div className="flex items-start gap-4">
          <BrandMark logo={integration.logo} className="h-12 w-12 shrink-0 rounded-xl" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">{integration.name}</h1>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">
              {integration.vendor} · {integration.category}
            </div>
          </div>
        </div>

        {panel}
      </div>
    </AppShell>
  );
}

export default function PluginDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);

  if (params.slug === WHATSAPP_SLUG) {
    return <RealIntegrationDetail slug={WHATSAPP_SLUG} panel={<WhatsAppSettingsPanel />} />;
  }

  if (params.slug === GEMINI_SLUG) {
    return <RealIntegrationDetail slug={GEMINI_SLUG} panel={<GeminiSettingsPanel />} />;
  }

  return (
    <Suspense>
      <IntegrationDetail slug={params.slug} />
    </Suspense>
  );
}
