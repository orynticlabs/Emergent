import { Bug, Flag, ListTodo, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared task type/constants used by the board, timeline, detail drawer, and
 * detail page. Kept in a leaf module (no imports from sibling project
 * components) so those components can all import from here without forming
 * a circular import with OryCMSProjectDetailPage.tsx — a cycle previously
 * caused a "Cannot access before initialization" crash at runtime because
 * module evaluation order isn't guaranteed across circular ES module graphs.
 */

export interface OryCMSProjectTask {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high";
  type: "task" | "bug" | "feature" | "milestone";
  assigneeId: string | null;
  assigneeName: string | null;
  parentId: string | null;
  parentTitle: string | null;
  subtaskCount: number;
  doneSubtaskCount: number;
  startDate: string | null;
  dueDate: string | null;
}

export const TASK_STATUS_LABELS: Record<OryCMSProjectTask["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export const PRIORITY_STYLES: Record<OryCMSProjectTask["priority"], string> = {
  low: "text-muted-foreground",
  medium: "text-foreground",
  high: "text-destructive",
};

export const TASK_TYPE_META: Record<OryCMSProjectTask["type"], { label: string; icon: LucideIcon; className: string }> = {
  task: { label: "Task", icon: ListTodo, className: "text-muted-foreground" },
  bug: { label: "Bug", icon: Bug, className: "text-destructive" },
  feature: { label: "Feature", icon: Sparkles, className: "text-info" },
  milestone: { label: "Milestone", icon: Flag, className: "text-warning" },
};

export function TaskTypeIcon({ type, className }: { type: OryCMSProjectTask["type"]; className?: string }) {
  const meta = TASK_TYPE_META[type];
  const Icon = meta.icon;
  return <Icon className={cn("h-3.5 w-3.5 shrink-0", meta.className, className)} aria-label={meta.label} />;
}

// ── Task ID / branch name ────────────────────────────────────────────────────

/** Short, stable, human-referenceable ID — first 8 chars of the task's UUID, same convention used for clients and projects elsewhere in the admin. */
export function taskShortId(task: Pick<OryCMSProjectTask, "id">): string {
  return task.id.slice(0, 8);
}

const BRANCH_PREFIX: Record<OryCMSProjectTask["type"], string> = {
  task: "task",
  bug: "bugfix",
  feature: "feature",
  milestone: "milestone",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** A git-friendly branch name derived from the task type, short ID, and title — e.g. "bugfix/a1b2c3d4-fix-login-page". */
export function taskBranchName(task: Pick<OryCMSProjectTask, "id" | "type" | "title">): string {
  const slug = slugify(task.title);
  const id = taskShortId(task);
  return slug ? `${BRANCH_PREFIX[task.type]}/${id}-${slug}` : `${BRANCH_PREFIX[task.type]}/${id}`;
}
