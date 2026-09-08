"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, ScrollText, ShieldCheck, ShieldOff } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import type { OryCMSAuditLog } from "@/audit";

interface MfaEnrollmentRow {
  id: string;
  name: string | null;
  email: string;
  roleName: string | null;
  mfaEnabled: boolean;
  mfaEnabledAt: string | null;
}

const RESOURCE_OPTIONS = [
  { value: "all", label: "All resources" },
  { value: "auth", label: "Security (auth)" },
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "content", label: "Content" },
  { value: "settings", label: "Settings" },
];

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConsoleLogsPage() {
  const { loaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("audit", "read");

  const [mfaRows, setMfaRows] = useState<MfaEnrollmentRow[]>([]);
  const [logs, setLogs] = useState<OryCMSAuditLog[]>([]);
  const [resource, setResource] = useState("auth");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded || !canRead) return;
    setLoading(true);
    const query = resource === "all" ? "" : `?resource=${encodeURIComponent(resource)}`;
    Promise.all([
      fetchJson<{ users: MfaEnrollmentRow[] }>("/api/orycms/audit/mfa-status"),
      fetchJson<OryCMSAuditLog[]>(`/api/orycms/audit${query}`),
    ])
      .then(([mfaRes, logsRes]) => {
        setMfaRows(mfaRes.users);
        setLogs(logsRes);
      })
      .catch((err) => {
        toast.error("Couldn't load console logs", {
          description: err instanceof Error ? err.message : undefined,
        });
      })
      .finally(() => setLoading(false));
  }, [loaded, canRead, resource]);

  // Fail-closed while the session is still loading - same convention the
  // sidebar uses (see AppSidebar.tsx's `allow`).
  if (!loaded) return null;

  if (!canRead) {
    return (
      <AppShell section="MFA Logs">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface/30 px-8 py-16 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-[13.5px] font-medium">Restricted to Admin and Super Admin</div>
            <p className="max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              MFA Logs shows security-sensitive activity - who has MFA enabled and the audit
              trail behind it - so only Admin and Super Admin roles can view it.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const enabledCount = mfaRows.filter((u) => u.mfaEnabled).length;

  return (
    <AppShell section="MFA Logs">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div>
          <div className="text-[12px] text-muted-foreground">System</div>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight">MFA Logs</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            MFA enrollment and the security audit trail. Visible to Admin and Super Admin only.
          </p>
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <div className="text-[13.5px] font-semibold">MFA registrations</div>
            <span className="ml-auto text-[11.5px] text-muted-foreground">
              {enabledCount} of {mfaRows.length} team members enrolled
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>MFA status</TableHead>
                  <TableHead>Enabled at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mfaRows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {mfaRows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.name || u.email}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.roleName || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                          u.mfaEnabled
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-border bg-surface-muted text-muted-foreground",
                        )}
                      >
                        {u.mfaEnabled ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <ShieldOff className="h-3 w-3" />
                        )}
                        {u.mfaEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(u.mfaEnabledAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[13.5px] font-semibold">Audit log</div>
            <div className="ml-auto w-[200px]">
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No log entries yet.
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {entry.userId ? `${entry.userId.slice(0, 8)}…` : "system"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px]">{entry.action}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.resource}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.ipAddress || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
