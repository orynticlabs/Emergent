"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Copy, ExternalLink, Mail, Phone, RefreshCw, Search, Trash2 } from "lucide-react";
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

type OryCMSBookingStatus = "confirmed" | "canceled" | "completed";

export interface OryCMSBooking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  startAt: string;
  endAt: string;
  visitorTimezone: string | null;
  meetingUrl: string | null;
  status: OryCMSBookingStatus;
  createdAt: string;
}

type StatusFilter = "all" | OryCMSBookingStatus;

const selectCls = "h-9 rounded-full border border-border bg-surface px-3.5 pr-8 text-[12.5px] text-foreground";

const STATUS_BADGE: Record<OryCMSBookingStatus, string> = {
  confirmed: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  canceled: "border-border bg-surface-muted text-muted-foreground",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function copyLink(url: string) {
  navigator.clipboard?.writeText(url).then(
    () => toast.success("Meeting link copied"),
    () => toast.error("Couldn't copy the link"),
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-4 py-3"><Skeleton className="h-3.5 w-20" /></td>
    </tr>
  );
}

export function OryCMSBookingsAdminPage() {
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("bookings", "read");
  const canUpdate = useOryCMSPermission("bookings", "update");
  const canDelete = useOryCMSPermission("bookings", "delete");

  const [bookings, setBookings] = useState<OryCMSBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [active, setActive] = useState<OryCMSBooking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OryCMSBooking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSBooking[]>("/api/orycms/bookings")
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const filtered = useMemo(() => {
    let rows = bookings;
    if (statusFilter !== "all") rows = rows.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          (b.company ?? "").toLowerCase().includes(q),
      );
    }
    return rows;
  }, [bookings, statusFilter, search]);

  const now = Date.now();
  const counts = useMemo(
    () => ({
      upcoming: bookings.filter((b) => b.status === "confirmed" && new Date(b.startAt).getTime() > now).length,
      today: bookings.filter((b) => {
        const d = new Date(b.startAt);
        const n = new Date();
        return b.status === "confirmed" && d.toDateString() === n.toDateString();
      }).length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      canceled: bookings.filter((b) => b.status === "canceled").length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings],
  );

  const updateStatus = async (booking: OryCMSBooking, status: OryCMSBookingStatus) => {
    setSavingStatus(true);
    try {
      const updated = await fetchJson<OryCMSBooking>(`/api/orycms/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
      setActive((prev) => (prev && prev.id === booking.id ? updated : prev));
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
      await fetchJson(`/api/orycms/bookings/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`Booking with "${deleteTarget.name}" removed`);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setActive((prev) => (prev && prev.id === deleteTarget.id ? null : prev));
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to remove booking", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setDeleting(false);
    }
  };

  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-40" />
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
            <CalendarCheck className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Bookings</div>
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
        eyebrow="Engagements"
        title="Bookings"
        description="Calls scheduled through the site-wide 'Book a Call' widget. Manage availability under Availability."
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Upcoming", value: counts.upcoming },
          { label: "Today", value: counts.today },
          { label: "Confirmed", value: counts.confirmed },
          { label: "Canceled", value: counts.canceled },
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
            placeholder="Search by name, email, company…"
            className="h-9 w-[260px] rounded-full pl-8 text-[12.5px] shadow-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
        <Button variant="outline" onClick={load} className="h-9 gap-1.5 rounded-full px-3.5 text-[12.5px]">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="ml-auto rounded-full border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground">
          {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-[13px]">
          <thead className="border-b border-border bg-surface-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Date &amp; time (IST)</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Meeting</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[13px] text-muted-foreground">
                  {bookings.length === 0 ? "No bookings yet." : "No bookings match your filters."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((booking) => (
                <tr
                  key={booking.id}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30"
                  onClick={() => setActive(booking)}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{booking.name}</div>
                    <div className="text-[11px] text-muted-foreground">{booking.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{formatDateTime(booking.startAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10.5px] capitalize", STATUS_BADGE[booking.status])}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {booking.meetingUrl ? (
                      <a
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Join
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
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
                <SheetDescription>{formatDateTime(active.startAt)} (IST)</SheetDescription>
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
                    <div className="mt-0.5 font-medium text-foreground">{active.company || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Visitor timezone</div>
                    <div className="mt-0.5 font-medium text-foreground">{active.visitorTimezone || "-"}</div>
                  </div>
                </div>

                {active.meetingUrl && (
                  <div>
                    <div className="text-[11px] text-muted-foreground">Meeting link</div>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-surface/60 p-3">
                      <a
                        href={active.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 flex-1 truncate text-blue-600 hover:underline"
                      >
                        {active.meetingUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => active.meetingUrl && copyLink(active.meetingUrl)}
                        aria-label="Copy meeting link"
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {active.notes && (
                  <div>
                    <div className="text-[11px] text-muted-foreground">Notes</div>
                    <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border bg-surface/60 p-3.5 leading-relaxed text-foreground">
                      {active.notes}
                    </p>
                  </div>
                )}

                {canUpdate && (
                  <div>
                    <div className="text-[11px] text-muted-foreground">Status</div>
                    <select
                      value={active.status}
                      disabled={savingStatus}
                      onChange={(e) => updateStatus(active, e.target.value as OryCMSBookingStatus)}
                      className={cn(selectCls, "mt-1.5 w-full")}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
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
                    Delete booking
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
            <AlertDialogTitle>Remove this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the booking with{" "}
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
