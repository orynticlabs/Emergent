"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  ClipboardList,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

// ── Shared types/helpers ─────────────────────────────────────────────────────

export interface OryCMSProject {
  id: string;
  name: string;
  description: string | null;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  startDate: string | null;
  dueDate: string | null;
  ownerId: string | null;
  ownerName: string | null;
  clientId: string | null;
  clientName: string | null;
  taskCount: number;
  doneTaskCount: number;
}

export interface OryCMSUserOption {
  id: string;
  name: string | null;
  email: string;
}

export interface OryCMSClientOption {
  id: string;
  name: string;
}

export const STATUS_LABELS: Record<OryCMSProject["status"], string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<OryCMSProject["status"], string> = {
  planning: "border-info/30 bg-info/10 text-info",
  active: "border-success/30 bg-success/10 text-success",
  on_hold: "border-warning/30 bg-warning/10 text-warning",
  completed: "border-border bg-surface-muted text-muted-foreground",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: OryCMSProject["status"] }) {
  return (
    <Badge variant="outline" className={cn("text-[10.5px]", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  const body = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!res.ok || !body.success) throw new Error(body.error?.message ?? "Request failed.");
  return body.data as T;
}

/** Searchable client picker - filters by name or client ID as you type. */
export function ClientCombobox({
  id,
  clients,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  clients: OryCMSClientOption[];
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = clients.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{selected.name}</span>
              <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                #{selected.id.slice(0, 8)}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">No client (internal)</span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command filter={(value, search) => (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}>
          <CommandInput placeholder="Search clients by name or ID…" className="h-9 text-[13px]" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-[12.5px] text-muted-foreground">
              No clients found.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__ no client internal"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <span className="text-muted-foreground">No client (internal)</span>
                {!value && <Check className="ml-auto h-3.5 w-3.5" />}
              </CommandItem>
              {clients.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.id}`}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{c.name}</span>
                    <span className="truncate font-mono text-[10.5px] text-muted-foreground">
                      #{c.id.slice(0, 8)}
                    </span>
                  </div>
                  {value === c.id && <Check className="ml-auto h-3.5 w-3.5 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Mirrors the real table row's columns so rows don't jump/reflow once data arrives. */
function ProjectRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-20" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </td>
    </tr>
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

/** Compact 0–100% bar - how much of a project's tasks are done. */
function TaskProgress({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${total > 0 ? pct : 0}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-[11.5px] text-muted-foreground">
        {done}/{total}
      </span>
    </div>
  );
}

export function OryCMSProjectsAdminPage() {
  const router = useRouter();
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("projects", "read");
  const canCreate = useOryCMSPermission("projects", "create");
  const canDelete = useOryCMSPermission("projects", "delete");

  const [projects, setProjects] = useState<OryCMSProject[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OryCMSProject["status"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OryCMSProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSProject[]>("/api/orycms/projects")
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchJson(`/api/orycms/projects/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      toast.error("Failed to delete project", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  // `canRead` fails closed while the session is still loading - wait for it
  // so a fresh page load doesn't flash "no access" before permissions arrive.
  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <ProjectRowSkeleton key={i} />
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
            <div className="text-[15px] font-semibold">You don't have access to Projects</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = projects.filter((p) => {
    const matchesSearch = search.trim()
      ? p.name.toLowerCase().includes(search.trim().toLowerCase())
      : true;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    totalTasks: projects.reduce((sum, p) => sum + p.taskCount, 0),
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Engagements"
          title="Projects"
          description="Track delivery projects, clients, owners, and tasks in one place."
        />
        {canCreate && (
          <Button
            className="h-9 gap-1.5 text-[13px]"
            onClick={() => router.push("/admin/projectx/new")}
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={FolderKanban} label="Total projects" value={String(stats.total)} />
        <StatCard icon={Activity} label="Active" value={String(stats.active)} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(stats.completed)} />
        <StatCard icon={ClipboardList} label="Total tasks" value={String(stats.totalTasks)} />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-surface/60 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="h-9 w-[240px] rounded-full pl-8 text-[12.5px] shadow-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OryCMSProject["status"] | "all")}
          className="h-9 rounded-full border border-border bg-surface px-3.5 text-[12.5px] text-foreground"
        >
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABELS) as OryCMSProject["status"][]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={load} className="h-9 gap-1.5 rounded-full px-3.5 text-[12.5px]">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="ml-auto rounded-full border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[680px] text-[13px]">
          <thead className="border-b border-border bg-surface-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Project
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Client
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Owner
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Tasks
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => <ProjectRowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px] text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "No projects match your filters."
                    : "No projects yet. Create your first one."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30"
                  onClick={() => router.push(`/admin/projectx/${project.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                    {project.clientName || "Internal"}
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                    {project.ownerName || "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <TaskProgress done={project.doneTaskCount} total={project.taskCount} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(project)}
                          aria-label={`Delete ${project.name}`}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">{deleteTarget?.name}</span> and all of its tasks. This
              cannot be undone.
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
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
