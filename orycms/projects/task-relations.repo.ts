import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import type { OryCMSTaskStatus } from "./project-tasks.repo";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSTaskRelationType = "blocks" | "relates_to" | "duplicates";
export type OryCMSTaskRelationDirection = "outgoing" | "incoming";

export interface OryCMSTaskRelationRecord {
  id: string;
  type: OryCMSTaskRelationType;
  direction: OryCMSTaskRelationDirection;
  relatedTaskId: string;
  relatedTaskTitle: string;
  relatedTaskStatus: OryCMSTaskStatus;
}

export interface OryCMSBlockingPair {
  blockerId: string;
  blockedId: string;
}

interface RelationRow {
  id: string;
  type: OryCMSTaskRelationType;
  direction: OryCMSTaskRelationDirection;
  related_task_id: string;
  related_task_title: string;
  related_task_status: OryCMSTaskStatus;
}

function rowToRelation(row: RelationRow): OryCMSTaskRelationRecord {
  return {
    id: row.id,
    type: row.type,
    direction: row.direction,
    relatedTaskId: row.related_task_id,
    relatedTaskTitle: row.related_task_title,
    relatedTaskStatus: row.related_task_status,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Both directions of every relation touching this task, each resolved against the *other* task's title/status. */
export async function listOryCMSTaskRelations(
  taskId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTaskRelationRecord[]> {
  const result = await pool.query<RelationRow>(
    `
    SELECT r.id, r.type, 'outgoing' AS direction, r.related_task_id, t.title AS related_task_title, t.status AS related_task_status
    FROM orycms_task_relations r
    JOIN orycms_project_tasks t ON t.id = r.related_task_id
    WHERE r.task_id = $1
    UNION ALL
    SELECT r.id, r.type, 'incoming' AS direction, r.task_id AS related_task_id, t.title AS related_task_title, t.status AS related_task_status
    FROM orycms_task_relations r
    JOIN orycms_project_tasks t ON t.id = r.task_id
    WHERE r.related_task_id = $1
    ORDER BY type, direction
    `,
    [taskId],
  );
  return result.rows.map(rowToRelation);
}

/** Every "blocks" pair among a project's tasks — used to draw dependency arrows on the Gantt timeline. */
export async function listOryCMSBlockingRelationsForProject(
  projectId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBlockingPair[]> {
  const result = await pool.query<{ blocker_id: string; blocked_id: string }>(
    `
    SELECT r.task_id AS blocker_id, r.related_task_id AS blocked_id
    FROM orycms_task_relations r
    JOIN orycms_project_tasks t ON t.id = r.task_id
    WHERE r.type = 'blocks' AND t.project_id = $1
    `,
    [projectId],
  );
  return result.rows.map((row) => ({ blockerId: row.blocker_id, blockedId: row.blocked_id }));
}

export async function addOryCMSTaskRelation(
  taskId: string,
  relatedTaskId: string,
  type: OryCMSTaskRelationType,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  if (taskId === relatedTaskId) {
    throw Object.assign(new Error("A task cannot relate to itself."), {
      code: "VALIDATION_ERROR",
      statusCode: 422,
    });
  }
  if (type === "relates_to") {
    // Symmetric: skip if the reverse pair already exists so it doesn't show twice.
    const existing = await pool.query(
      `SELECT 1 FROM orycms_task_relations WHERE task_id = $1 AND related_task_id = $2 AND type = 'relates_to'`,
      [relatedTaskId, taskId],
    );
    if ((existing.rowCount ?? 0) > 0) return;
  }
  await pool.query(
    `INSERT INTO orycms_task_relations (task_id, related_task_id, type)
     VALUES ($1, $2, $3)
     ON CONFLICT (task_id, related_task_id, type) DO NOTHING`,
    [taskId, relatedTaskId, type],
  );
}

export async function removeOryCMSTaskRelation(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await pool.query(`DELETE FROM orycms_task_relations WHERE id = $1`, [id]);
}
