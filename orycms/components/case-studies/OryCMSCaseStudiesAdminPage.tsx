"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
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

export interface OryCMSCaseStudy {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  industry: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

type StatusFilter = "all" | "active" | "inactive";
type SortOption = "order" | "newest" | "oldest";

const selectCls =
  "h-9 rounded-full border border-border bg-surface px-3.5 pr-8 text-[12.5px] text-foreground";

function CaseStudyRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-4 rounded" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-20" />
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

export function OryCMSCaseStudiesAdminPage() {
  const router = useRouter();
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("case-studies", "read");
  const canCreate = useOryCMSPermission("case-studies", "create");
  const canUpdate = useOryCMSPermission("case-studies", "update");
  const canDelete = useOryCMSPermission("case-studies", "delete");

  const [caseStudies, setCaseStudies] = useState<OryCMSCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<OryCMSCaseStudy[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("order");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSCaseStudy[]>("/api/orycms/case-studies")
      .then(setCaseStudies)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load case studies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const filtered = useMemo(() => {
    let rows = caseStudies;
    if (statusFilter !== "all") rows = rows.filter((c) => (statusFilter === "active" ? c.active : !c.active));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }
    rows = [...rows].sort((a, b) => {
      if (sortBy === "order") return a.sortOrder - b.sortOrder;
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortBy === "newest" ? -diff : diff;
    });
    return rows;
  }, [caseStudies, statusFilter, search, sortBy]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  const toggleSelectAll = () => {
    setSelected(allFilteredSelected ? new Set() : new Set(filtered.map((c) => c.id)));
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
        deleteTargets.map((t) => fetchJson(`/api/orycms/case-studies/${t.id}`, { method: "DELETE" })),
      );
      toast.success(
        deleteTargets.length === 1 ? `"${deleteTargets[0].title}" removed` : `${deleteTargets.length} case studies removed`,
      );
      const removedIds = new Set(deleteTargets.map((t) => t.id));
      setCaseStudies((prev) => prev.filter((c) => !removedIds.has(c.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        removedIds.forEach((id) => next.delete(id));
        return next;
      });
      setDeleteTargets(null);
    } catch (err) {
      toast.error("Failed to remove case stud(y/ies)", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (caseStudy: OryCMSCaseStudy) => {
    const next = !caseStudy.active;
    setCaseStudies((prev) => prev.map((c) => (c.id === caseStudy.id ? { ...c, active: next } : c)));
    try {
      await fetchJson(`/api/orycms/case-studies/${caseStudy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
    } catch (err) {
      setCaseStudies((prev) => prev.map((c) => (c.id === caseStudy.id ? { ...c, active: !next } : c)));
      toast.error("Failed to update case study", {
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
                <CaseStudyRowSkeleton key={i} />
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
            <Briefcase className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Case Studies</div>
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
          title="Case Studies"
          description="Manage the case studies shown in the site's portfolio."
        />
        {canCreate && (
          <Button className="h-9 gap-1.5 text-[13px]" onClick={() => router.push("/admin/case-studies/new")}>
            <Plus className="h-4 w-4" />
            Add case study
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
            placeholder="Search by title or slug…"
            className="h-9 w-[240px] rounded-full pl-8 text-[12.5px] shadow-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={selectCls}>
          <option value="order">Sort order</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <Button variant="outline" onClick={load} className="h-9 gap-1.5 rounded-full px-3.5 text-[12.5px]">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="ml-auto rounded-full border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground">
          {filtered.length} case stud{filtered.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      {selectedCount > 0 && canDelete && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <span className="text-[12.5px] text-foreground">{selectedCount} selected</span>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 gap-1.5 text-[12.5px]"
            onClick={() => setDeleteTargets(caseStudies.filter((c) => selected.has(c.id)))}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-[13px]">
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
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <CaseStudyRowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px] text-muted-foreground">
                  {caseStudies.length === 0 ? "No case studies yet. Add your first one." : "No case studies match your filters."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((caseStudy) => (
                <tr
                  key={caseStudy.id}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30",
                    selected.has(caseStudy.id) && "bg-accent/20",
                  )}
                  onClick={() => canUpdate && router.push(`/admin/case-studies/${caseStudy.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(caseStudy.id)}
                      onChange={() => toggleSelectOne(caseStudy.id)}
                      className="h-4 w-4 rounded border-border"
                      aria-label={`Select ${caseStudy.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted/40">
                        {caseStudy.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={caseStudy.imageUrl} alt={caseStudy.title} className="h-full w-full object-cover" />
                        ) : (
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">{caseStudy.title}</div>
                        <div className="truncate text-[11px] text-muted-foreground">/{caseStudy.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{caseStudy.category || "-"}</td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{caseStudy.sortOrder}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => canUpdate && toggleActive(caseStudy)}
                      disabled={!canUpdate}
                      className="disabled:cursor-not-allowed"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10.5px]",
                          caseStudy.active
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-border bg-surface-muted text-muted-foreground",
                        )}
                      >
                        {caseStudy.active ? "Active" : "Inactive"}
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
                          onClick={() => router.push(`/admin/case-studies/${caseStudy.id}`)}
                          aria-label={`Edit ${caseStudy.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTargets([caseStudy])}
                          aria-label={`Remove ${caseStudy.title}`}
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
              {deleteTargets && deleteTargets.length > 1 ? `Remove ${deleteTargets.length} case studies?` : "Remove case study?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTargets && deleteTargets.length > 1 ? (
                <>This will permanently remove the selected case studies. This cannot be undone.</>
              ) : (
                <>
                  This will permanently remove <span className="font-medium">{deleteTargets?.[0]?.title}</span> from
                  the portfolio. This cannot be undone.
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
