"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Lock,
  Plus,
  Receipt,
  TriangleAlert,
  Wallet,
  Webhook,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Button } from "@/components/ui/button";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { OryCMSCreatePaymentLinkDialog } from "@/components/payments/OryCMSCreatePaymentLinkDialog";
import type { OryCMSPaymentLinkRecord, OryCMSPaymentRecord } from "@/payments";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground">{label}</div>
          <div className="truncate text-[18px] font-semibold tracking-tight num">{value}</div>
        </div>
      </div>
    </Card>
  );
}

const STATUS_STYLES: Record<string, string> = {
  paid: "border-success/30 bg-success/10 text-success",
  captured: "border-success/30 bg-success/10 text-success",
  created: "border-border bg-surface-muted text-muted-foreground",
  authorized: "border-warning/30 bg-warning/10 text-warning",
  pending: "border-warning/30 bg-warning/10 text-warning",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  expired: "border-destructive/30 bg-destructive/10 text-destructive",
  refunded: "border-border bg-surface-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium capitalize",
        STATUS_STYLES[status] ?? "border-border bg-surface-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentsPage() {
  const { loaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("payments", "read");
  const canCreate = useOryCMSPermission("payments", "create");

  const [links, setLinks] = useState<OryCMSPaymentLinkRecord[]>([]);
  const [payments, setPayments] = useState<OryCMSPaymentRecord[]>([]);
  const [configured, setConfigured] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/orycms/webhooks/razorpay`);
  }, []);

  useEffect(() => {
    if (!loaded || !canRead) return;
    setLoading(true);
    Promise.all([
      fetchJson<{ links: OryCMSPaymentLinkRecord[] }>("/api/orycms/payments/links"),
      fetchJson<{
        payments: OryCMSPaymentRecord[];
        configured: boolean;
        webhookConfigured: boolean;
      }>("/api/orycms/payments"),
    ])
      .then(([linksRes, paymentsRes]) => {
        setLinks(linksRes.links);
        setPayments(paymentsRes.payments);
        setConfigured(paymentsRes.configured);
        setWebhookConfigured(paymentsRes.webhookConfigured);
      })
      .catch((err) => {
        toast.error("Couldn't load payments", {
          description: err instanceof Error ? err.message : undefined,
        });
      })
      .finally(() => setLoading(false));
  }, [loaded, canRead]);

  const capturedTotal = payments
    .filter((p) => p.status === "captured")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied");
  };

  // Fail-closed while the session is still loading - same convention as
  // AppSidebar.tsx's `allow` and the MFA Logs page.
  if (!loaded) return null;

  if (!canRead) {
    return (
      <AppShell section="Payments">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface/30 px-8 py-16 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-[13.5px] font-medium">Restricted to Admin and Super Admin</div>
            <p className="max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              Payments handles real transactions, so only Admin and Super Admin roles can view or
              create payment links.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell section="Payments">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[12px] text-muted-foreground">Platform</div>
            <h1 className="mt-1 text-[26px] font-semibold tracking-tight">Payments</h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Create Razorpay payment links and track received payments via webhook.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New payment link
            </Button>
          )}
        </div>

        {!configured && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="text-[12.5px] leading-relaxed text-warning">
              Razorpay isn&apos;t configured yet. Set <code className="font-mono">RAZORPAY_KEY_ID</code>{" "}
              and <code className="font-mono">RAZORPAY_KEY_SECRET</code> in the environment before
              creating payment links.
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Link2} label="Payment links" value={String(links.length)} />
          <StatCard icon={Receipt} label="Payments received" value={String(payments.length)} />
          <StatCard
            icon={Wallet}
            label="Total captured"
            value={formatCurrency(capturedTotal / 100)}
          />
        </div>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-foreground">
              <Webhook className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[13.5px] font-semibold">Webhook</div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                    webhookConfigured
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border bg-surface-muted text-muted-foreground",
                  )}
                >
                  {webhookConfigured && <CheckCircle2 className="h-3 w-3" />}
                  {webhookConfigured ? "Configured" : "Not configured"}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Paste this into Razorpay Dashboard → Settings → Webhooks, subscribed to at least{" "}
                <code className="font-mono">payment_link.paid</code>,{" "}
                <code className="font-mono">payment.captured</code>, and{" "}
                <code className="font-mono">payment.failed</code>.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface-muted/40 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{webhookUrl}</span>
                <Button variant="ghost" size="sm" onClick={copyWebhookUrl} className="h-7 shrink-0 px-2">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13.5px] font-semibold">Payment links</div>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Links created from OryCMS. Status updates automatically once Razorpay confirms payment
            via webhook.
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No payment links yet.
                    </TableCell>
                  </TableRow>
                )}
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="num">{formatCurrency(Number(link.amount) / 100)}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{link.description || "-"}</TableCell>
                    <TableCell>{link.customerName || link.customerEmail || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={link.status} />
                    </TableCell>
                    <TableCell>
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-foreground/80 hover:text-foreground"
                      >
                        Open
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(link.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13.5px] font-semibold">Payments received</div>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Log of verified Razorpay webhook events - the source of truth for what was actually
            paid.
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No payments received yet.
                    </TableCell>
                  </TableRow>
                )}
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="num">
                      {formatCurrency(Number(payment.amount) / 100)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="uppercase text-muted-foreground">
                      {payment.method || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.email || payment.contact || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {payment.eventType}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.receivedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <OryCMSCreatePaymentLinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(link) => setLinks((prev) => [link, ...prev])}
      />
    </AppShell>
  );
}
