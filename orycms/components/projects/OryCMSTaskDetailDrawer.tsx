"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  CornerDownRight,
  GitBranch,
  GitPullRequestArrow,
  Hash,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, oryCMSAvatarUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchJson, type OryCMSUserOption } from "./OryCMSProjectsAdminPage";
import {
  TASK_STATUS_LABELS,
  TASK_TYPE_META,
  TaskTypeIcon,
  taskBranchName,
  taskShortId,
  type OryCMSProjectTask,
} from "./task-types";
export type OryCMSTaskRelationType = "blocks" | "relates_to" | "duplicates";

export interface OryCMSTaskRelation {
  id: string;
  type: OryCMSTaskRelationType;
  direction: "outgoing" | "incoming";
  relatedTaskId: string;
  relatedTaskTitle: string;
  relatedTaskStatus: OryCMSProjectTask["status"];
}

const PRIORITY_LABELS: Record<OryCMSProjectTask["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const RELATION_TYPE_LABELS: Record<OryCMSTaskRelationType, string> = {
  blocks: "Blocks",
  relates_to: "Relates to",
  duplicates: "Duplicates",
};

function relationLabel(relation: OryCMSTaskRelation): string {
  if (relation.type === "relates_to") return "Related to";
  if (relation.direction === "outgoing") return relation.type === "blocks" ? "Blocks" : "Duplicates";
  return relation.type === "blocks" ? "Blocked by" : "Duplicated by";
}

function CopyRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <button
      onClick={() => void copy()}
      title={`Copy ${label.toLowerCase()}`}
      className="flex w-full items-center gap-2 rounded-md border border-border bg-surface-muted/40 px-2.5 py-1.5 text-left transition-colors hover:border-border-strong"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-mono text-[11.5px]">{value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

export function OryCMSTaskDetailDrawer({
  projectId,
  task,
  allTasks,
  users,
  canUpdate,
  onClose,
  onChanged,
  onDeleted,
  onSubtaskAdded,
}: {
  projectId: string;
  task: OryCMSProjectTask;
  allTasks: OryCMSProjectTask[];
  users: OryCMSUserOption[];
  canUpdate: boolean;
  onClose: () => void;
  onChanged: (task: OryCMSProjectTask) => void;
  onDeleted: (id: string) => void;
  onSubtaskAdded: (task: OryCMSProjectTask) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [type, setType] = useState(task.type);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [parentId, setParentId] = useState(task.parentId ?? "");
  const [startDate, setStartDate] = useState(task.startDate ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [relations, setRelations] = useState<OryCMSTaskRelation[]>([]);
  const [relationType, setRelationType] = useState<OryCMSTaskRelationType>("blocks");
  const [relatedTaskId, setRelatedTaskId] = useState("");
  const [addingRelation, setAddingRelation] = useState(false);

  useEffect(() => {
    fetchJson<OryCMSTaskRelation[]>(`/api/orycms/projects/${projectId}/tasks/${task.id}/relations`)
      .then(setRelations)
      .catch(() => {});
  }, [projectId, task.id]);

  const subtasks = allTasks.filter((t) => t.parentId === task.id);
  // A task can't parent itself or any of its own subtasks (one level of cycle guard).
  const parentOptions = allTasks.filter((t) => t.id !== task.id && !subtasks.some((s) => s.id === t.id));

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const updated = await fetchJson<OryCMSProjectTask>(
        `/api/orycms/projects/${projectId}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            type,
            status,
            priority,
            assigneeId: assigneeId || null,
            parentId: parentId || null,
            startDate: startDate || null,
            dueDate: dueDate || null,
          }),
        },
      );
      onChanged(updated);
      toast.success("Task saved");
    } catch (err) {
      toast.error("Failed to save task", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await fetchJson(`/api/orycms/projects/${projectId}/tasks/${task.id}`, { method: "DELETE" });
      onDeleted(task.id);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function addRelation() {
    if (!relatedTaskId || addingRelation) return;
    setAddingRelation(true);
    try {
      const updated = await fetchJson<OryCMSTaskRelation[]>(
        `/api/orycms/projects/${projectId}/tasks/${task.id}/relations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relatedTaskId, type: relationType }),
        },
      );
      setRelations(updated);
      setRelatedTaskId("");
    } catch (err) {
      toast.error("Failed to add relation", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setAddingRelation(false);
    }
  }

  async function removeRelation(relationId: string) {
    try {
      await fetchJson(`/api/orycms/projects/${projectId}/tasks/${task.id}/relations/${relationId}`, {
        method: "DELETE",
      });
      setRelations((prev) => prev.filter((r) => r.id !== relationId));
    } catch (err) {
      toast.error("Failed to remove relation", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function addSubtask() {
    if (!subtaskTitle.trim() || addingSubtask) return;
    setAddingSubtask(true);
    try {
      const created = await fetchJson<OryCMSProjectTask>(`/api/orycms/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: subtaskTitle.trim(), parentId: task.id }),
      });
      onSubtaskAdded(created);
      setSubtaskTitle("");
    } catch (err) {
      toast.error("Failed to add subtask", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setAddingSubtask(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <TaskTypeIcon type={type} className="h-4 w-4" />
          <span className="text-[12px] text-muted-foreground">{TASK_TYPE_META[type].label}</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 px-5 py-4">
          {task.parentTitle && (
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <CornerDownRight className="h-3.5 w-3.5" />
              Subtask of <span className="font-medium text-foreground">{task.parentTitle}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="td-title">Title</Label>
            <Input id="td-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canUpdate} />
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <CopyRow icon={Hash} label="Task ID" value={taskShortId(task)} />
            <CopyRow icon={GitBranch} label="Branch name" value={taskBranchName({ id: task.id, type, title: title || task.title })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="td-type">Type</Label>
              <select
                id="td-type"
                value={type}
                onChange={(e) => setType(e.target.value as OryCMSProjectTask["type"])}
                disabled={!canUpdate}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
              >
                {Object.entries(TASK_TYPE_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="td-status">Status</Label>
              <select
                id="td-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OryCMSProjectTask["status"])}
                disabled={!canUpdate}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
              >
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="td-priority">Priority</Label>
              <select
                id="td-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as OryCMSProjectTask["priority"])}
                disabled={!canUpdate}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="td-start">Start date</Label>
              <Input
                id="td-start"
                type="date"
                value={startDate ?? ""}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!canUpdate}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="td-due">Due date</Label>
              <Input
                id="td-due"
                type="date"
                value={dueDate ?? ""}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!canUpdate}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="td-assignee">Assignee</Label>
              <div className="flex items-center gap-2">
                {assigneeId && (
                  <Avatar className="h-7 w-7 shrink-0 border border-border">
                    <AvatarImage src={oryCMSAvatarUrl(assigneeId)} alt="" />
                    <AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">
                      {(users.find((u) => u.id === assigneeId)?.name ?? "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <select
                  id="td-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={!canUpdate}
                  className="h-9 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="td-parent">Parent task</Label>
              <select
                id="td-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={!canUpdate}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
              >
                <option value="">No parent</option>
                {parentOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="td-description">Description</Label>
            <Textarea
              id="td-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={!canUpdate}
              placeholder="What needs to happen here?"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px]">
              Subtasks {subtasks.length > 0 && `(${subtasks.filter((s) => s.status === "done").length}/${subtasks.length})`}
            </Label>
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {subtasks.length === 0 && (
                <li className="px-3 py-4 text-center text-[12px] text-muted-foreground">No subtasks yet.</li>
              )}
              {subtasks.map((s) => (
                <li key={s.id} className="flex items-center gap-2 px-3 py-2">
                  <TaskTypeIcon type={s.type} className="h-3.5 w-3.5" />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12.5px]",
                      s.status === "done" && "text-muted-foreground line-through",
                    )}
                  >
                    {s.title}
                  </span>
                </li>
              ))}
              {canUpdate && (
                <li className="flex items-center gap-2 px-3 py-2">
                  <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <Input
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void addSubtask()}
                    placeholder="Add a subtask and press Enter…"
                    className="h-7 flex-1 text-[12.5px]"
                    disabled={addingSubtask}
                  />
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[12.5px]">
              <GitPullRequestArrow className="h-3.5 w-3.5 text-muted-foreground" />
              Relations
            </Label>
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {relations.length === 0 && (
                <li className="px-3 py-4 text-center text-[12px] text-muted-foreground">No relations yet.</li>
              )}
              {relations.map((r) => (
                <li key={`${r.id}-${r.direction}`} className="flex items-center gap-2 px-3 py-2">
                  <span
                    className={cn(
                      "shrink-0 text-[10.5px] font-medium uppercase tracking-wide",
                      r.type === "blocks" && r.direction === "outgoing" && "text-destructive",
                      r.type === "blocks" && r.direction === "incoming" && "text-warning",
                    )}
                  >
                    {relationLabel(r)}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12.5px]",
                      r.relatedTaskStatus === "done" && "text-muted-foreground line-through",
                    )}
                  >
                    {r.relatedTaskTitle}
                  </span>
                  {canUpdate && (
                    <button
                      onClick={() => void removeRelation(r.id)}
                      aria-label="Remove relation"
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
              {canUpdate && (
                <li className="flex items-center gap-1.5 px-3 py-2">
                  <select
                    value={relationType}
                    onChange={(e) => setRelationType(e.target.value as OryCMSTaskRelationType)}
                    className="h-7 shrink-0 rounded-md border border-border bg-surface px-1.5 text-[11px] text-foreground"
                  >
                    {Object.entries(RELATION_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={relatedTaskId}
                    onChange={(e) => setRelatedTaskId(e.target.value)}
                    className="h-7 min-w-0 flex-1 rounded-md border border-border bg-surface px-1.5 text-[11.5px] text-foreground"
                  >
                    <option value="">Select a task…</option>
                    {allTasks
                      .filter((t) => t.id !== task.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                  <Button
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => void addRelation()}
                    disabled={!relatedTaskId || addingRelation}
                    aria-label="Add relation"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {canUpdate && (
          <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="text-muted-foreground">Delete this task?</span>
                <button
                  onClick={() => void handleDelete()}
                  className="font-medium text-destructive hover:underline"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
