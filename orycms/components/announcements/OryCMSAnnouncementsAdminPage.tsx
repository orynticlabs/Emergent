"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Megaphone, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
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

// ── Shared types/helpers ─────────────────────────────────────────────────────

export interface OryCMSAnnouncement {
  id: string;
  tag: string;
  color: "orange" | "blue" | "neutral";
  message: string;
  link: string | null;
  ctaLabel: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

const COLOR_STYLES: Record<OryCMSAnnouncement["color"], string> = {
  orange: "border-warning/30 bg-warning/10 text-warning",
  blue: "border-info/30 bg-info/10 text-info",
  neutral: "border-border bg-surface-muted text-muted-foreground",
};

const COLOR_LABELS: Record<OryCMSAnnouncement["color"], string> = {
  orange: "Orange",
  blue: "Blue",
  neutral: "Neutral",
};

type StatusFilter = "all" | "active" | "inactive";
type SortOption = "newest" | "oldest" | "order";

const selectCls =
  "h-9 rounded-full border border-border bg-surface px-3.5 pr-8 text-[12.5px] text-foreground";

/** Mirrors the real table row's columns so rows don't jump/reflow once data arrives. */
function AnnouncementRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-4 rounded" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-64" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-12 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

export function OryCMSAnnouncementsAdminPage() {
  const router = useRouter();
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("announcements", "read");
  const canCreate = useOryCMSPermission("announcements", "create");
  const canUpdate = useOryCMSPermission("announcements", "update");
  const canDelete = useOryCMSPermission("announcements", "delete");

  const [announcements, setAnnouncements] = useState<OryCMSAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<OryCMSAnnouncement[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState<"all" | OryCMSAnnouncement["color"]>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSAnnouncement[]>("/api/orycms/announcements")
      .then(setAnnouncements)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load announcements."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const filtered = useMemo(() => {
    let rows = announcements;
    if (colorFilter !== "all") rows = rows.filter((a) => a.color === colorFilter);
    if (statusFilter !== "all") rows = rows.filter((a) => (statusFilter === "active" ? a.active : !a.active));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((a) => a.tag.toLowerCase().includes(q) || a.message.toLowerCase().includes(q));
    }
    rows = [...rows].sort((a, b) => {
      if (sortBy === "order") return a.sortOrder - b.sortOrder;
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortBy === "newest" ? -diff : diff;
    });
    return rows;
  }, [announcements, colorFilter, statusFilter, search, sortBy]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allFilteredSelected) return new Set();
      return new Set(filtered.map((a) => a.id));
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmDelete = async () => {
    if (!deleteTargets || deleteTargets.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(
        deleteTargets.map((t) => fetchJson(`/api/orycms/announcements/${t.id}`, { method: "DELETE" })),
      );
      toast.success(
        deleteTargets.length === 1 ? `"${deleteTargets[0].tag}" removed` : `${deleteTargets.length} announcements removed`,
      );
      const removedIds = new Set(deleteTargets.map((t) => t.id));
      setAnnouncements((prev) => prev.filter((a) => !removedIds.has(a.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        removedIds.forEach((id) => next.delete(id));
        return next;
      });
      setDeleteTargets(null);
    } catch (err) {
      toast.error("Failed to remove announcement(s)", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (announcement: OryCMSAnnouncement) => {
    const next = !announcement.active;
    setAnnouncements((prev) => prev.map((a) => (a.id === announcement.id ? { ...a, active: next } : a)));
    try {
      await fetchJson(`/api/orycms/announcements/${announcement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
    } catch (err) {
      setAnnouncements((prev) => prev.map((a) => (a.id === announcement.id ? { ...a, active: !next } : a)));
      toast.error("Failed to update announcement", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <AnnouncementRowSkeleton key={i} />
              ))}
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
            <Megaphone className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Announcements</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCount = selected.size;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Feature"
          title="Announcement"
          description="Manage the announcement bar shown at the top of the marketing site."
        />
        {canCreate && (
          <Button className="h-9 gap-1.5 text-[13px]" onClick={() => router.push("/admin/announcements/new")}>
            <Plus className="h-4 w-4" />
            Add announcement
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      {/* Filter / toolbar bar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-surface/60 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by tag or message…"
            className="h-9 w-[280px] rounded-full pl-8 text-[12.5px] shadow-none"
          />
        </div>
        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value as typeof colorFilter)} className={selectCls}>
          <option value="all">All colors</option>
          {Object.entries(COLOR_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={selectCls}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="order">Sort order</option>
        </select>
        <Button
          variant="outline"
          onClick={load}
          className="h-9 gap-1.5 rounded-full px-3.5 text-[12.5px]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="ml-auto rounded-full border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground">
          {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {selectedCount > 0 && canDelete && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <span className="text-[12.5px] text-foreground">
            {selectedCount} selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 gap-1.5 text-[12.5px]"
            onClick={() => setDeleteTargets(announcements.filter((a) => selected.has(a.id)))}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead className="border-b border-border bg-surface-muted/50">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  disabled={filtered.length === 0}
                  className="h-4 w-4 rounded border-border"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Tag</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Message</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Link</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <AnnouncementRowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px] text-muted-foreground">
                  {announcements.length === 0
                    ? "No announcements yet. Add your first one."
                    : "No announcements match your filters."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((announcement) => (
                <tr
                  key={announcement.id}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30",
                    selected.has(announcement.id) && "bg-accent/20",
                  )}
                  onClick={() => canUpdate && router.push(`/admin/announcements/${announcement.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(announcement.id)}
                      onChange={() => toggleSelectOne(announcement.id)}
                      className="h-4 w-4 rounded border-border"
                      aria-label={`Select ${announcement.tag}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.15em]", COLOR_STYLES[announcement.color])}>
                      {announcement.tag}
                    </span>
                  </td>
                  <td className="max-w-[320px] truncate px-4 py-3 text-[12.5px]">{announcement.message}</td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                    {announcement.link ? (
                      <span className="truncate">{announcement.ctaLabel ? `${announcement.ctaLabel} → ${announcement.link}` : announcement.link}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => canUpdate && toggleActive(announcement)}
                      disabled={!canUpdate}
                      className="disabled:cursor-not-allowed"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10.5px]",
                          announcement.active
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-border bg-surface-muted text-muted-foreground",
                        )}
                      >
                        {announcement.active ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {canUpdate && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/announcements/${announcement.id}`)}
                          aria-label={`Edit ${announcement.tag}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTargets([announcement])}
                          aria-label={`Remove ${announcement.tag}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTargets} onOpenChange={(open) => !open && setDeleteTargets(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTargets && deleteTargets.length > 1 ? `Remove ${deleteTargets.length} announcements?` : "Remove announcement?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTargets && deleteTargets.length > 1 ? (
                <>This will permanently remove the selected announcements. This cannot be undone.</>
              ) : (
                <>
                  This will permanently remove the <span className="font-medium">{deleteTargets?.[0]?.tag}</span> announcement.
                  This cannot be undone.
                </>
              )}
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
