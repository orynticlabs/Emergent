import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSTaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type OryCMSTaskPriority = "low" | "medium" | "high";
export type OryCMSTaskType = "task" | "bug" | "feature" | "milestone";

export interface OryCMSProjectTaskRecord {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: OryCMSTaskStatus;
  priority: OryCMSTaskPriority;
  type: OryCMSTaskType;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  parentId: string | null;
  parentTitle: string | null;
  subtaskCount: number;
  doneSubtaskCount: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSProjectTaskInput {
  title: string;
  description?: string | null;
  status?: OryCMSTaskStatus;
  priority?: OryCMSTaskPriority;
  type?: OryCMSTaskType;
  assigneeId?: string | null;
  parentId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: OryCMSTaskStatus;
  priority: OryCMSTaskPriority;
  type: OryCMSTaskType;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  parent_id: string | null;
  parent_title: string | null;
  subtask_count: string;
  done_subtask_count: string;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTask(row: TaskRow): OryCMSProjectTaskRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    type: row.type,
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    assigneeEmail: row.assignee_email,
    parentId: row.parent_id,
    parentTitle: row.parent_title,
    subtaskCount: parseInt(row.subtask_count, 10) || 0,
    doneSubtaskCount: parseInt(row.done_subtask_count, 10) || 0,
    startDate: row.start_date,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TASK_SELECT = `
  SELECT
    t.id, t.project_id, t.title, t.description, t.status, t.priority, t.type,
    t.assignee_id, u.name AS assignee_name, u.email AS assignee_email,
    t.parent_id, p.title AS parent_title,
    (SELECT COUNT(*) FROM orycms_project_tasks c WHERE c.parent_id = t.id) AS subtask_count,
    (SELECT COUNT(*) FROM orycms_project_tasks c WHERE c.parent_id = t.id AND c.status = 'done') AS done_subtask_count,
    t.start_date, t.due_date, t.created_at, t.updated_at
  FROM orycms_project_tasks t
  LEFT JOIN orycms_users u ON u.id = t.assignee_id
  LEFT JOIN orycms_project_tasks p ON p.id = t.parent_id
`;

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSProjectTasks(
  projectId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectTaskRecord[]> {
  const result = await pool.query<TaskRow>(
    `${TASK_SELECT} WHERE t.project_id = $1 ORDER BY t.created_at ASC`,
    [projectId],
  );
  return result.rows.map(rowToTask);
}

export async function getOryCMSProjectTask(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectTaskRecord> {
  const result = await pool.query<TaskRow>(`${TASK_SELECT} WHERE t.id = $1`, [id]);
  const task = result.rows[0];
  if (!task) throw new OryCMSAuthError("UNAUTHORIZED", "Task not found.", 404);
  return rowToTask(task);
}

export async function createOryCMSProjectTask(
  projectId: string,
  input: OryCMSProjectTaskInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectTaskRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_project_tasks (project_id, title, description, status, priority, type, assignee_id, parent_id, start_date, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      projectId,
      input.title,
      input.description ?? null,
      input.status ?? "todo",
      input.priority ?? "medium",
      input.type ?? "task",
      input.assigneeId ?? null,
      input.parentId ?? null,
      input.startDate ?? null,
      input.dueDate ?? null,
    ],
  );
  return getOryCMSProjectTask(result.rows[0].id, pool);
}

export async function updateOryCMSProjectTask(
  id: string,
  input: Partial<OryCMSProjectTaskInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectTaskRecord> {
  if (input.parentId === id) {
    throw Object.assign(new Error("A task cannot be its own parent."), {
      code: "VALIDATION_ERROR",
      statusCode: 422,
    });
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    type: input.type,
    assignee_id: input.assigneeId,
    parent_id: input.parentId,
    start_date: input.startDate,
    due_date: input.dueDate,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return getOryCMSProjectTask(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);
  const result = await pool.query(
    `UPDATE orycms_project_tasks SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
    values,
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Task not found.", 404);
  return getOryCMSProjectTask(id, pool);
}

export async function deleteOryCMSProjectTask(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await pool.query(`DELETE FROM orycms_project_tasks WHERE id = $1`, [id]);
}
