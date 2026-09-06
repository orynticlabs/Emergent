"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle2, Database, Gauge, RefreshCw, ScrollText, ShieldCheck, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";

interface OryCMSMigrationRow {
  migrationId: string;
  name: string;
  appliedAt: string;
  durationMs: number;
}

interface RunMigrationsResult {
  install: { success: boolean; applied: string[] };
  seeded: boolean;
}

interface OryCMSConnectionInfo {
  ok: boolean;
  latencyMs: number | null;
  version: string | null;
  error: string | null;
}

interface OryCMSPoolInfo {
  total: number;
  idle: number;
  waiting: number;
  max: number;
}

interface OryCMSWarning {
  level: "warning" | "info";
  message: string;
}

interface OryCMSActivityEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface OryCMSDatabaseHealth {
  connection: OryCMSConnectionInfo;
  pool: OryCMSPoolInfo;
  warnings: OryCMSWarning[];
  activity: OryCMSActivityEntry[];
}

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-border last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-3.5 w-32" />
        </td>
      ))}
    </tr>
  );
}

function StatTile({ icon: Icon, label, value, tone = "default" }: { icon: typeof Database; label: string; value: string; tone?: "default" | "good" | "bad" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
          tone === "good"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            : tone === "bad"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-surface-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="truncate text-[13.5px] font-semibold">{value}</div>
      </div>
    </div>
  );
}

function formatActivityMessage(entry: OryCMSActivityEntry): string {
  if (entry.action === "migrate") {
    const applied = Array.isArray(entry.metadata?.applied) ? (entry.metadata!.applied as unknown[]).length : 0;
    return applied > 0 ? `Ran migrations — ${applied} applied` : "Ran migrations — schema already up to date";
  }
  return `${entry.action} · ${entry.resource}`;
}

/**
 * Runs core schema install + role/permission reseed (POST
 * /api/orycms/database/migrations → bootstrapOryCMS). Both the schema install
 * and the ORYCMS_DEFAULT_PERMISSIONS seed are idempotent — safe to run any
 * number of times. This is the fix for "I added a new permission resource in
 * code but nobody's session has it yet": the matrix in rbac.engine.ts only
 * becomes real database rows once this runs — the warnings list below
 * surfaces exactly that drift so it doesn't have to be discovered the hard
 * way (a nav item silently missing) again.
 */
export function OryCMSDatabaseAdminPage() {
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("migrations", "read");
  const canRun = useOryCMSPermission("migrations", "create");

  const [migrations, setMigrations] = useState<OryCMSMigrationRow[]>([]);
  const [health, setHealth] = useState<OryCMSDatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSMigrationRow[]>("/api/orycms/database/migrations")
      .then(setMigrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load migrations."))
      .finally(() => setLoading(false));
  };

  const loadHealth = () => {
    setHealthLoading(true);
    fetchJson<OryCMSDatabaseHealth>("/api/orycms/database/health")
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setHealthLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) {
      load();
      loadHealth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const runMigrations = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await fetchJson<RunMigrationsResult>("/api/orycms/database/migrations", {
        method: "POST",
      });
      if (result.install.applied.length > 0) {
        toast.success(`Schema up to date — ${result.install.applied.length} migration(s) applied`);
      } else {
        toast.success("Schema already up to date — roles & permissions reseeded");
      }
      load();
      loadHealth();
    } catch (err) {
      toast.error("Failed to run migrations", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setRunning(false);
    }
  };

  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Database className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Database</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connection = health?.connection;
  const pool = health?.pool;
  const warnings = health?.warnings ?? [];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
      <PageHeader
        eyebrow="Platform internals"
        title="Database"
        description="Connection health, pending schema drift, migration runs, and recent database activity — end to end, in one place."
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold">Connection</h2>
          <Button variant="outline" onClick={loadHealth} className="h-8 gap-1.5 rounded-full px-3 text-[12px]">
            <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin" : ""}`} />
            Recheck
          </Button>
        </div>

        {healthLoading && !health ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={connection?.ok ? CheckCircle2 : XCircle}
              label="Status"
              value={connection?.ok ? "Connected" : connection?.error ? "Unreachable" : "Unknown"}
              tone={connection?.ok ? "good" : "bad"}
            />
            <StatTile icon={Gauge} label="Latency" value={connection?.latencyMs != null ? `${connection.latencyMs}ms` : "—"} />
            <StatTile icon={Database} label="Server version" value={connection?.version ?? "—"} />
            <StatTile
              icon={ShieldCheck}
              label="Pool (active / idle / waiting)"
              value={pool ? `${pool.total} / ${pool.idle} / ${pool.waiting}` : "—"}
              tone={pool && pool.waiting > 0 ? "bad" : "default"}
            />
          </div>
        )}

        {connection && !connection.ok && connection.error && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
            {connection.error}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2.5 text-[13.5px] font-semibold">Warnings</h2>
        {healthLoading && !health ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : warnings.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3.5 text-[12.5px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            No warnings — schema, permissions, and connection pool all look healthy.
          </div>
        ) : (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-3.5 text-[12.5px] ${
                  w.level === "warning"
                    ? "border-amber-500/30 bg-amber-500/[0.07] text-amber-700 dark:text-amber-400"
                    : "border-border bg-surface-muted/60 text-muted-foreground"
                }`}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Card className="rounded-2xl border-border bg-surface/60 shadow-none">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface">
              <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold">Run migrations &amp; sync permissions</div>
              <p className="mt-0.5 max-w-md text-[12.5px] text-muted-foreground">
                Installs any pending core schema migrations, then reseeds the default role
                permission matrix — including any new resource added since the DB was last
                seeded — and clears the permission cache immediately.
              </p>
            </div>
          </div>
          {canRun && (
            <Button onClick={runMigrations} disabled={running} className="h-9 gap-1.5 text-[13px]">
              {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {running ? "Running…" : "Run Migrations"}
            </Button>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold">Applied migrations</h2>
          <Button variant="outline" onClick={load} className="h-8 gap-1.5 rounded-full px-3 text-[12px]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Migration</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Applied at</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} cols={3} />)}
              {!loading && migrations.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[13px] text-muted-foreground">
                    No migrations recorded yet.
                  </td>
                </tr>
              )}
              {!loading &&
                migrations.map((m) => (
                  <tr key={m.migrationId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                    <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                      {new Date(m.appliedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{m.durationMs}ms</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13.5px] font-semibold">Recent activity</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Event</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">When</th>
              </tr>
            </thead>
            <tbody>
              {healthLoading && !health && Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} cols={2} />)}
              {!healthLoading && (health?.activity.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-[13px] text-muted-foreground">
                    No database activity recorded yet.
                  </td>
                </tr>
              )}
              {!healthLoading &&
                health?.activity.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{formatActivityMessage(entry)}</td>
                    <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
