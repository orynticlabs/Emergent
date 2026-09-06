"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, RefreshCw, Search, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";

export interface OryCMSHireStaffRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string | null;
  engagementModel: string | null;
  teamSize: string | null;
  timeline: string | null;
  message: string | null;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

type StatusFilter = "all" | "new" | "contacted" | "closed";

const selectCls = "h-9 rounded-full border border-border bg-surface px-3.5 pr-8 text-[12.5px] text-foreground";

const STATUS_BADGE: Record<OryCMSHireStaffRequest["status"], string> = {
  new: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  contacted: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  closed: "border-border bg-surface-muted text-muted-foreground",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function RowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-28" /></td>
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-28" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-24" /></td>
    </tr>
  );
}

export function OryCMSHireStaffRequestsAdminPage() {
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("hire-staff-requests", "read");
  const canUpdate = useOryCMSPermission("hire-staff-requests", "update");
  const canDelete = useOryCMSPermission("hire-staff-requests", "delete");

  const [requests, setRequests] = useState<OryCMSHireStaffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [active, setActive] = useState<OryCMSHireStaffRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OryCMSHireStaffRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSHireStaffRequest[]>("/api/orycms/hire-staff-requests")
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const filtered = useMemo(() => {
    let rows = requests;
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.company ?? "").toLowerCase().includes(q) ||
          (r.role ?? "").toLowerCase().includes(q),
      );
    }
    return rows;
  }, [requests, statusFilter, search]);

  const counts = useMemo(
    () => ({
      total: requests.length,
      new: requests.filter((r) => r.status === "new").length,
      contacted: requests.filter((r) => r.status === "contacted").length,
      closed: requests.filter((r) => r.status === "closed").length,
    }),
    [requests],
  );

  const updateStatus = async (request: OryCMSHireStaffRequest, status: OryCMSHireStaffRequest["status"]) => {
    setSavingStatus(true);
    try {
      const updated = await fetchJson<OryCMSHireStaffRequest>(`/api/orycms/hire-staff-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setRequests((prev) => prev.map((r) => (r.id === request.id ? updated : r)));
      setActive((prev) => (prev && prev.id === request.id ? updated : prev));
    } catch (err) {
      toast.error("Failed to update status", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSavingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchJson(`/api/orycms/hire-staff-requests/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`Request from "${deleteTarget.name}" removed`);
      setRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setActive((prev) => (prev && prev.id === deleteTarget.id ? null : prev));
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to remove request", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setDeleting(false);
    }
  };

  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Hire Staff Requests</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
      <PageHeader
        eyebrow="Feature"
        title="Hire Staff Requests"
        description="Leads submitted through the /hire-staff page's popup form."
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.total },
          { label: "New", value: counts.new },
          { label: "Contacted", value: counts.contacted },
          { label: "Closed", value: counts.closed },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-[22px] font-semibold tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-surface/60 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company, role…"
            className="h-9 w-[260px] rounded-full pl-8 text-[12.5px] shadow-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <Button variant="outline" onClick={load} className="h-9 gap-1.5 rounded-full px-3.5 text-[12.5px]">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="ml-auto rounded-full border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground">
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead className="border-b border-border bg-surface-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Company</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Engagement</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px] text-muted-foreground">
                  {requests.length === 0 ? "No requests yet." : "No requests match your filters."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((request) => (
                <tr
                  key={request.id}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30"
                  onClick={() => setActive(request)}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{request.name}</div>
                    <div className="text-[11px] text-muted-foreground">{request.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{request.company || "—"}</td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{request.role || "—"}</td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{request.engagementModel || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10.5px] capitalize", STATUS_BADGE[request.status])}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{formatDate(request.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.name}</SheetTitle>
                <SheetDescription>Submitted {formatDate(active.createdAt)}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5 text-[13px]">
                <div className="flex flex-col gap-1.5">
                  <a href={`mailto:${active.email}`} className="inline-flex items-center gap-2 text-foreground hover:underline">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {active.email}
                  </a>
                  {active.phone && (
                    <a href={`tel:${active.phone}`} className="inline-flex items-center gap-2 text-foreground hover:underline">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {active.phone}
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface/60 p-4">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Company</div>
                    <div className="mt-0.5 font-medium text-foreground">{active.company || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Role needed</div>
                    <div className="mt-0.5 font-medium text-foreground">{active.role || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Engagement model</div>
                    <div className="mt-0.5 font-medium text-foreground">{active.engagementModel || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Team size</div>
                    <div className="mt-0.5 font-medium text-foreground">{active.teamSize || "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[11px] text-muted-foreground">Timeline</div>
                    <div className="mt-0.5 font-medium text-foreground">{active.timeline || "—"}</div>
                  </div>
                </div>

                {active.message && (
                  <div>
                    <div className="text-[11px] text-muted-foreground">Details</div>
                    <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border bg-surface/60 p-3.5 leading-relaxed text-foreground">
                      {active.message}
                    </p>
                  </div>
                )}

                {canUpdate && (
                  <div>
                    <div className="text-[11px] text-muted-foreground">Status</div>
                    <select
                      value={active.status}
                      disabled={savingStatus}
                      onChange={(e) => updateStatus(active, e.target.value as OryCMSHireStaffRequest["status"])}
                      className={cn(selectCls, "mt-1.5 w-full")}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}

                {canDelete && (
                  <Button
                    variant="destructive"
                    className="w-full gap-1.5"
                    onClick={() => setDeleteTarget(active)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete request
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the request from{" "}
              <span className="font-medium">{deleteTarget?.name}</span>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
