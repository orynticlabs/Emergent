"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CornerDownRight,
  GanttChartSquare,
  Kanban,
  List as ListIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { OryCMSProjectBoard } from "./OryCMSProjectBoard";
import { OryCMSProjectTimeline } from "./OryCMSProjectTimeline";
import { OryCMSProjectMembers } from "./OryCMSProjectMembers";
import { OryCMSTaskDetailDrawer } from "./OryCMSTaskDetailDrawer";
import {
  TASK_STATUS_LABELS,
  PRIORITY_STYLES,
  TASK_TYPE_META,
  TaskTypeIcon,
  taskShortId,
  type OryCMSProjectTask,
} from "./task-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useOryCMSPermission } from "@/hooks";
import { cn, oryCMSAvatarUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  fetchJson,
  STATUS_LABELS,
  StatusBadge,
  ClientCombobox,
  type OryCMSProject,
  type OryCMSUserOption,
  type OryCMSClientOption,
} from "./OryCMSProjectsAdminPage";

function TaskRowSkeleton() {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-0">
      <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
      <Skeleton className="h-3.5 w-40 flex-1" />
      <Skeleton className="h-8 w-28 rounded-md" />
      <Skeleton className="h-8 w-24 rounded-md" />
      <Skeleton className="h-7 w-7 rounded-md" />
    </li>
  );
}

function NewTaskRow({
  projectId,
  users,
  onAdd,
}: {
  projectId: string;
  users: OryCMSUserOption[];
  onAdd: (task: OryCMSProjectTask) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<OryCMSProjectTask["type"]>("task");
  const [assigneeId, setAssigneeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const task = await fetchJson<OryCMSProjectTask>(`/api/orycms/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), type, assigneeId: assigneeId || null }),
      });
      onAdd(task);
      setTitle("");
    } catch (err) {
      toast.error("Failed to add task", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-2 px-4 py-3">
      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as OryCMSProjectTask["type"])}
        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
      >
        {Object.entries(TASK_TYPE_META).map(([value, meta]) => (
          <option key={value} value={value}>
            {meta.label}
          </option>
        ))}
      </select>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void submit()}
        placeholder="Add a task and press Enter…"
        className="h-8 flex-1 text-[13px]"
        disabled={submitting}
      />
      <select
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email}
          </option>
        ))}
      </select>
    </li>
  );
}

function TaskRow({
  projectId,
  task,
  users,
  canUpdate,
  isSubtask,
  onChanged,
  onDeleted,
  onOpen,
}: {
  projectId: string;
  task: OryCMSProjectTask;
  users: OryCMSUserOption[];
  canUpdate: boolean;
  isSubtask?: boolean;
  onChanged: (task: OryCMSProjectTask) => void;
  onDeleted: (id: string) => void;
  onOpen: (task: OryCMSProjectTask) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const updated = await fetchJson<OryCMSProjectTask>(
        `/api/orycms/projects/${projectId}/tasks/${task.id}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      onChanged(updated);
    } catch (err) {
      toast.error("Failed to update task", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await fetchJson(`/api/orycms/projects/${projectId}/tasks/${task.id}`, { method: "DELETE" });
      onDeleted(task.id);
    } catch (err) {
      toast.error("Failed to delete task", {
        description: err instanceof Error ? err.message : undefined,
      });
      setBusy(false);
    }
  }

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-accent/20",
        isSubtask && "bg-surface-muted/30 pl-9",
      )}
    >
      {isSubtask && <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
      <TaskTypeIcon type={task.type} />
      <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        #{taskShortId(task)}
      </span>
      <button
        onClick={() => onOpen(task)}
        className={cn(
          "min-w-0 flex-1 truncate text-left text-[13px] hover:underline",
          task.status === "done" && "text-muted-foreground line-through",
        )}
      >
        {task.title}
        {task.subtaskCount > 0 && (
          <span className="ml-1.5 text-[11px] font-normal text-muted-foreground no-underline">
            ({task.doneSubtaskCount}/{task.subtaskCount})
          </span>
        )}
      </button>
      <span className={cn("text-[11px] font-medium uppercase", PRIORITY_STYLES[task.priority])}>
        {task.priority}
      </span>
      <select
        value={task.status}
        onChange={(e) => void patch({ status: e.target.value })}
        disabled={!canUpdate || busy}
        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground disabled:opacity-50"
      >
        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {task.assigneeId && (
        <Avatar title={task.assigneeName ?? undefined} className="h-6 w-6 shrink-0 border border-border">
          <AvatarImage src={oryCMSAvatarUrl(task.assigneeId)} alt="" />
          <AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">
            {(task.assigneeName ?? "?").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <select
        value={task.assigneeId ?? ""}
        onChange={(e) => void patch({ assigneeId: e.target.value || null })}
        disabled={!canUpdate || busy}
        className="h-8 w-36 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground disabled:opacity-50"
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email}
          </option>
        ))}
      </select>
      {canUpdate && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => void remove()}
          disabled={busy}
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </li>
  );
}

export function OryCMSProjectDetailPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const canUpdate = useOryCMSPermission("projects", "update");
  const canDelete = useOryCMSPermission("projects", "delete");

  const [project, setProject] = useState<OryCMSProject | null>(null);
  const [tasks, setTasks] = useState<OryCMSProjectTask[]>([]);
  const [users, setUsers] = useState<OryCMSUserOption[]>([]);
  const [clients, setClients] = useState<OryCMSClientOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<OryCMSProject["status"]>("planning");
  const [ownerId, setOwnerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [taskView, setTaskView] = useState<"board" | "list" | "timeline">("board");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJson<OryCMSProject>(`/api/orycms/projects/${projectId}`),
      fetchJson<OryCMSProjectTask[]>(`/api/orycms/projects/${projectId}/tasks`),
      fetchJson<OryCMSUserOption[]>("/api/orycms/users").catch(() => []),
      fetchJson<OryCMSClientOption[]>("/api/orycms/clients").catch(() => []),
    ])
      .then(([p, t, us, cs]) => {
        setProject(p);
        setName(p.name);
        setDescription(p.description ?? "");
        setStatus(p.status);
        setOwnerId(p.ownerId ?? "");
        setClientId(p.clientId ?? "");
        setTasks(t);
        setUsers(us);
        setClients(cs);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project."))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await fetchJson<OryCMSProject>(`/api/orycms/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          ownerId: ownerId || null,
          clientId: clientId || null,
        }),
      });
      setProject(updated);
      toast.success("Project saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save project.";
      setError(message);
      toast.error("Failed to save project", { description: message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetchJson(`/api/orycms/projects/${projectId}`, { method: "DELETE" });
      toast.success("Project deleted");
      router.push("/admin/projectx");
    } catch (err) {
      toast.error("Failed to delete project", {
        description: err instanceof Error ? err.message : undefined,
      });
      setDeleting(false);
    }
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  // Flatten into display order: each top-level task immediately followed by
  // its subtasks, so the list reads as a one-level work-package hierarchy.
  const orderedTaskRows: { task: OryCMSProjectTask; isSubtask: boolean }[] = [];
  for (const task of tasks.filter((t) => !t.parentId)) {
    orderedTaskRows.push({ task, isSubtask: false });
    for (const child of tasks.filter((t) => t.parentId === task.id)) {
      orderedTaskRows.push({ task: child, isSubtask: true });
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/admin/projectx")}
            className="mb-2 flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </button>
          <PageHeader
            eyebrow="Engagements · Projects"
            title={loading ? "Project" : name || "Project"}
            description={!loading && project ? `${doneCount}/${tasks.length} tasks done` : undefined}
          />
        </div>
        {!loading && canDelete && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete project
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : !project ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error ?? "Project not found."}
        </div>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="text-[14px] font-semibold">Project details</div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-name">Name</Label>
                  <Input
                    id="p-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!canUpdate}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-status">Status</Label>
                  <select
                    id="p-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OryCMSProject["status"])}
                    disabled={!canUpdate}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-client">Client</Label>
                  <ClientCombobox
                    id="p-client"
                    clients={clients}
                    value={clientId}
                    onChange={setClientId}
                    disabled={!canUpdate}
                  />
                  {project?.clientId && (
                    <Link
                      href={`/admin/clients/${project.clientId}`}
                      className="inline-block text-[11.5px] text-muted-foreground hover:text-foreground"
                    >
                      View client →
                    </Link>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-owner">Owner</Label>
                  <select
                    id="p-owner"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    disabled={!canUpdate}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="p-description">Description</Label>
                  <Textarea
                    id="p-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    disabled={!canUpdate}
                  />
                </div>
              </div>
              {error && <p className="text-[12px] text-destructive">{error}</p>}
              {canUpdate && (
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving || !name.trim()}>
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
            </div>

            <OryCMSProjectMembers projectId={projectId} users={users} canUpdate={canUpdate} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-medium">Tasks</Label>
              <div className="inline-flex items-center rounded-md border border-border bg-surface-muted p-0.5 text-[12px]">
                <button
                  onClick={() => setTaskView("board")}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 transition-colors",
                    taskView === "board"
                      ? "bg-surface text-foreground shadow-xs font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Kanban className="h-3.5 w-3.5" />
                  Board
                </button>
                <button
                  onClick={() => setTaskView("list")}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 transition-colors",
                    taskView === "list"
                      ? "bg-surface text-foreground shadow-xs font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ListIcon className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  onClick={() => setTaskView("timeline")}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 transition-colors",
                    taskView === "timeline"
                      ? "bg-surface text-foreground shadow-xs font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <GanttChartSquare className="h-3.5 w-3.5" />
                  Timeline
                </button>
              </div>
            </div>

            {taskView === "timeline" ? (
              <OryCMSProjectTimeline
                projectId={projectId}
                tasks={tasks}
                projectStartDate={project.startDate}
                projectDueDate={project.dueDate}
                onOpen={(task) => setActiveTaskId(task.id)}
              />
            ) : taskView === "board" ? (
              <OryCMSProjectBoard
                projectId={projectId}
                tasks={tasks}
                canUpdate={canUpdate}
                onChanged={(updated) =>
                  setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                }
                onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                onAdd={(task) => setTasks((prev) => [...prev, task])}
                onOpen={(task) => setActiveTaskId(task.id)}
              />
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {tasks.length === 0 && (
                  <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                    No tasks yet.
                  </li>
                )}
                {orderedTaskRows.map(({ task, isSubtask }) => (
                  <TaskRow
                    key={task.id}
                    projectId={projectId}
                    task={task}
                    users={users}
                    canUpdate={canUpdate}
                    isSubtask={isSubtask}
                    onChanged={(updated) =>
                      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                    }
                    onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                    onOpen={(t) => setActiveTaskId(t.id)}
                  />
                ))}
                {canUpdate && (
                  <NewTaskRow
                    projectId={projectId}
                    users={users}
                    onAdd={(task) => setTasks((prev) => [...prev, task])}
                  />
                )}
              </ul>
            )}
          </div>
        </>
      )}

      {activeTask && (
        <OryCMSTaskDetailDrawer
          projectId={projectId}
          task={activeTask}
          allTasks={tasks}
          users={users}
          canUpdate={canUpdate}
          onClose={() => setActiveTaskId(null)}
          onChanged={(updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
          onDeleted={(id) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setActiveTaskId(null);
          }}
          onSubtaskAdded={(task) => setTasks((prev) => [...prev, task])}
        />
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium">{name}</span> and all of
              its tasks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
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
