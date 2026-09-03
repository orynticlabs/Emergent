"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CornerDownRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, oryCMSAvatarUrl } from "@/lib/utils";
import { fetchJson } from "./OryCMSProjectsAdminPage";
import {
  TASK_STATUS_LABELS,
  PRIORITY_STYLES,
  TaskTypeIcon,
  taskShortId,
  type OryCMSProjectTask,
} from "./task-types";

const COLUMNS = Object.keys(TASK_STATUS_LABELS) as OryCMSProjectTask["status"][];

const COLUMN_ACCENT: Record<OryCMSProjectTask["status"], string> = {
  todo: "bg-muted-foreground/40",
  in_progress: "bg-info",
  in_review: "bg-warning",
  done: "bg-success",
};

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function BoardCard({
  task,
  canUpdate,
  onDragStart,
  onDelete,
  onOpen,
}: {
  task: OryCMSProjectTask;
  canUpdate: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDelete: (task: OryCMSProjectTask) => void;
  onOpen: (task: OryCMSProjectTask) => void;
}) {
  return (
    <div
      draggable={canUpdate}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpen(task)}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-surface p-3 text-left shadow-xs transition-colors",
        canUpdate && "active:cursor-grabbing hover:border-border-strong",
      )}
    >
      {task.parentTitle && (
        <div className="mb-1.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
          <CornerDownRight className="h-3 w-3 shrink-0" />
          <span className="truncate">{task.parentTitle}</span>
        </div>
      )}
      <div className="flex items-start gap-2">
        {canUpdate && <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
        <TaskTypeIcon type={task.type} className="mt-0.5" />
        <div className="min-w-0 flex-1 text-[12.5px] font-medium leading-snug">{task.title}</div>
        {canUpdate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            aria-label={`Delete ${task.title}`}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground/70">#{taskShortId(task)}</span>
          <span className={cn("text-[10.5px] font-medium uppercase tracking-wide", PRIORITY_STYLES[task.priority])}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {task.subtaskCount > 0 && (
            <span className="text-[10.5px] text-muted-foreground">
              {task.doneSubtaskCount}/{task.subtaskCount} sub
            </span>
          )}
          {task.dueDate && (
            <span className="text-[10.5px] text-muted-foreground">
              {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
          {task.assigneeName && task.assigneeId && (
            <Avatar title={task.assigneeName} className="h-5 w-5 shrink-0 border border-border">
              <AvatarImage src={oryCMSAvatarUrl(task.assigneeId)} alt="" />
              <AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">
                {initials(task.assigneeName)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAddCard({
  projectId,
  status,
  onAdd,
}: {
  projectId: string;
  status: OryCMSProjectTask["status"];
  onAdd: (task: OryCMSProjectTask) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const task = await fetchJson<OryCMSProjectTask>(`/api/orycms/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), status }),
      });
      onAdd(task);
      setTitle("");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to add task", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <Input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit();
          if (e.key === "Escape") {
            setOpen(false);
            setTitle("");
          }
        }}
        onBlur={() => {
          if (!title.trim()) setOpen(false);
        }}
        placeholder="Task title…"
        className="h-8 text-[12.5px]"
        disabled={submitting}
      />
    </div>
  );
}

export function OryCMSProjectBoard({
  projectId,
  tasks,
  canUpdate,
  onChanged,
  onDeleted,
  onAdd,
  onOpen,
}: {
  projectId: string;
  tasks: OryCMSProjectTask[];
  canUpdate: boolean;
  onChanged: (task: OryCMSProjectTask) => void;
  onDeleted: (id: string) => void;
  onAdd: (task: OryCMSProjectTask) => void;
  onOpen: (task: OryCMSProjectTask) => void;
}) {
  const [dragOverColumn, setDragOverColumn] = useState<OryCMSProjectTask["status"] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OryCMSProjectTask | null>(null);

  async function moveTask(taskId: string, status: OryCMSProjectTask["status"]) {
    const current = tasks.find((t) => t.id === taskId);
    if (!current || current.status === status) return;
    // Optimistic update so the drop feels instant; rolled back on failure.
    onChanged({ ...current, status });
    try {
      const updated = await fetchJson<OryCMSProjectTask>(
        `/api/orycms/projects/${projectId}/tasks/${taskId}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) },
      );
      onChanged(updated);
    } catch (err) {
      onChanged(current);
      toast.error("Failed to move task", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function removeTask(task: OryCMSProjectTask) {
    try {
      await fetchJson(`/api/orycms/projects/${projectId}/tasks/${task.id}`, { method: "DELETE" });
      onDeleted(task.id);
    } catch (err) {
      toast.error("Failed to delete task", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              if (!canUpdate) return;
              e.preventDefault();
              setDragOverColumn(status);
            }}
            onDragLeave={() => setDragOverColumn((c) => (c === status ? null : c))}
            onDrop={(e) => {
              if (!canUpdate) return;
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain");
              setDragOverColumn(null);
              if (taskId) void moveTask(taskId, status);
            }}
            className={cn(
              "flex flex-col rounded-xl border border-border bg-surface-muted/40 p-2.5 transition-colors",
              dragOverColumn === status && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", COLUMN_ACCENT[status])} />
              <span className="text-[12px] font-semibold">{TASK_STATUS_LABELS[status]}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{columnTasks.length}</span>
            </div>
            <div className="flex-1 space-y-2">
              {columnTasks.map((task) => (
                <BoardCard
                  key={task.id}
                  task={task}
                  canUpdate={canUpdate}
                  onDragStart={(e, taskId) => e.dataTransfer.setData("text/plain", taskId)}
                  onDelete={setDeleteTarget}
                  onOpen={onOpen}
                />
              ))}
              {columnTasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-border px-2 py-4 text-center text-[11.5px] text-muted-foreground">
                  Drop tasks here
                </div>
              )}
            </div>
            {canUpdate && (
              <div className="mt-2">
                <QuickAddCard projectId={projectId} status={status} onAdd={onAdd} />
              </div>
            )}
          </div>
        );
      })}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[14px] font-semibold">Delete task?</div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              "{deleteTarget.title}" will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-8 rounded-md border border-border px-3 text-[12.5px] font-medium hover:border-border-strong"
              >
                Cancel
              </button>
              <button
                onClick={() => void removeTask(deleteTarget)}
                className="h-8 rounded-md bg-destructive px-3 text-[12.5px] font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
