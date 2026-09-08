"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  PlugZap,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { cn } from "@/lib/utils";
import { BrandMark } from "./_components";
import {
  INTEGRATIONS,
  STATUS_LABEL,
  STATUS_TINT,
  type IntegrationCategory,
  type IntegrationStatus,
} from "./_data";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

const CATEGORIES: ("All" | IntegrationCategory)[] = [
  "All",
  "Payments",
  "Communication",
  "Analytics",
  "Marketing",
  "Shipping",
  "Developer",
  "AI",
];

const STATUS_FILTERS: ("All" | IntegrationStatus)[] = [
  "All",
  "connected",
  "not_connected",
  "attention",
];

function IntegrationsHero() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-[12px] text-muted-foreground">Platform / Integrations</div>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Connect OryCMS to payment, messaging, analytics, and shipping platforms - start with the
          Dummy Platform connector to see the full connect flow end-to-end.
        </p>
      </div>
      <Link
        href="/admin/plugins/dummy-platform"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-[12.5px] font-medium text-background hover:opacity-90 transition-opacity"
      >
        <PlugZap className="h-3.5 w-3.5" />
        Connect a platform
      </Link>
    </div>
  );
}

function StatCards({ statuses }: { statuses: Record<string, IntegrationStatus> }) {
  const total = INTEGRATIONS.length;
  const connected = INTEGRATIONS.filter((i) => statuses[i.slug] === "connected").length;
  const attention = INTEGRATIONS.filter((i) => statuses[i.slug] === "attention").length;
  const categories = new Set(INTEGRATIONS.map((i) => i.category)).size;

  const stats = [
    { label: "Connected", value: connected, icon: CheckCircle2, tone: "text-success" },
    { label: "Available", value: total, icon: LayoutGrid, tone: "text-foreground" },
    { label: "Categories", value: categories, icon: Sparkles, tone: "text-info" },
    { label: "Needs attention", value: attention, icon: ShieldAlert, tone: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </span>
              <Icon className={cn("h-4 w-4", stat.tone)} />
            </div>
            <div className={cn("mt-2 text-[24px] font-semibold tracking-tight num", stat.tone)}>
              {stat.value}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function IntegrationCard({
  integration,
  status,
}: {
  integration: (typeof INTEGRATIONS)[number];
  status: IntegrationStatus;
}) {
  return (
    <Link
      href={`/admin/plugins/${integration.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <BrandMark logo={integration.logo} className="h-10 w-10 shrink-0" />
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-1 text-[11px] font-medium",
            STATUS_TINT[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold">{integration.name}</span>
          {integration.popular && (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10.5px] text-muted-foreground">
              Popular
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{integration.category}</div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {integration.description}
        </p>
      </div>
      <div className="mt-4 text-[12px] font-medium text-foreground group-hover:underline">
        {status === "connected" ? "Configure" : "Connect"} &rarr;
      </div>
    </Link>
  );
}

function IntegrationsGrid({ statuses }: { statuses: Record<string, IntegrationStatus> }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [spinning, setSpinning] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return INTEGRATIONS.filter((integration) => {
      const matchesQuery =
        !query ||
        integration.name.toLowerCase().includes(query) ||
        integration.vendor.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query);
      const matchesCategory = category === "All" || integration.category === category;
      const matchesStatus = statusFilter === "All" || statuses[integration.slug] === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [search, category, statusFilter, statuses]);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 text-[12.5px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations"
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
            className="h-9 appearance-none rounded-full border border-border bg-background pl-3 pr-7 text-[12px] font-medium text-foreground outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as (typeof STATUS_FILTERS)[number])}
            className="h-9 appearance-none rounded-full border border-border bg-background pl-3 pr-7 text-[12px] font-medium text-foreground outline-none"
          >
            <option value="All">All statuses</option>
            <option value="connected">Connected</option>
            <option value="not_connected">Not connected</option>
            <option value="attention">Needs attention</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <button
          onClick={() => {
            setSpinning(true);
            window.setTimeout(() => setSpinning(false), 500);
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[12px] font-medium text-foreground hover:border-border-strong transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
          Refresh
        </button>

        <span className="ml-auto rounded-full bg-surface-muted px-2.5 py-1 text-[11.5px] text-muted-foreground">
          {filtered.length} of {INTEGRATIONS.length} integrations
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((integration) => (
          <IntegrationCard
            key={integration.slug}
            integration={integration}
            status={statuses[integration.slug] ?? integration.defaultStatus}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-[12.5px] text-muted-foreground">
            No integrations match your filters.
          </div>
        )}
      </div>
    </Card>
  );
}

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>(() =>
    Object.fromEntries(INTEGRATIONS.map((i) => [i.slug, i.defaultStatus])),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStatuses((prev) => {
      const next = { ...prev };
      for (const integration of INTEGRATIONS) {
        const stored = window.localStorage.getItem(`orycms.integration.${integration.slug}`);
        if (stored === "connected" || stored === "not_connected" || stored === "attention") {
          next[integration.slug] = stored;
        }
      }
      return next;
    });

    // WhatsApp is the one card backed by a real connector (see
    // app/api/orycms/whatsapp/settings/route.ts) - override its badge with
    // live status instead of the localStorage mock every other card uses.
    // A 403 (no whatsapp:manage permission) or any other failure just
    // leaves the mock default in place rather than breaking the page.
    fetchJson<{ settings: { connected: boolean } | null }>("/api/orycms/whatsapp/settings")
      .then((res) => {
        setStatuses((prev) => ({
          ...prev,
          "whatsapp-business": res.settings?.connected ? "connected" : "not_connected",
        }));
      })
      .catch(() => {});

    // Same override for the Gemini AI card (see
    // app/api/orycms/gemini/settings/route.ts) - independent of the
    // WhatsApp fetch above, each module's status comes from its own API.
    fetchJson<{ settings: { connected: boolean } | null }>("/api/orycms/gemini/settings")
      .then((res) => {
        setStatuses((prev) => ({
          ...prev,
          "gemini-ai": res.settings?.connected ? "connected" : "not_connected",
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <AppShell section="Integrations">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <IntegrationsHero />
        <StatCards statuses={statuses} />
        <IntegrationsGrid statuses={statuses} />
      </div>
    </AppShell>
  );
}
