import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { publishOryCMSNotification } from "./notification-bus";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSNotificationType = "project_assignment" | "task_assignment";

export interface OryCMSNotificationRecord {
  id: string;
  userId: string;
  type: OryCMSNotificationType;
  title: string;
  body: string | null;
  actorId: string | null;
  actorName: string | null;
  projectId: string | null;
  taskId: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface OryCMSNotificationInput {
  userId: string;
  type: OryCMSNotificationType;
  title: string;
  body?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  link?: string | null;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS orycms_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES orycms_users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  actor_id     UUID REFERENCES orycms_users(id) ON DELETE SET NULL,
  actor_name   TEXT,
  project_id   UUID REFERENCES orycms_projects(id) ON DELETE CASCADE,
  task_id      UUID REFERENCES orycms_project_tasks(id) ON DELETE CASCADE,
  link         TEXT,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_on_user        ON orycms_notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_on_user_unread ON orycms_notifications (user_id, is_read);
`;

async function ensureTable(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLE_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface NotificationRow {
  id: string;
  user_id: string;
  type: OryCMSNotificationType;
  title: string;
  body: string | null;
  actor_id: string | null;
  actor_name: string | null;
  project_id: string | null;
  task_id: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

function rowToNotification(row: NotificationRow): OryCMSNotificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    actorId: row.actor_id,
    actorName: row.actor_name,
    projectId: row.project_id,
    taskId: row.task_id,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSNotifications(
  userId: string,
  filter: { type?: OryCMSNotificationType; unreadOnly?: boolean } = {},
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSNotificationRecord[]> {
  await ensureTable(pool);
  const conditions = ["user_id = $1"];
  const values: unknown[] = [userId];
  if (filter.type) {
    values.push(filter.type);
    conditions.push(`type = $${values.length}`);
  }
  if (filter.unreadOnly) {
    conditions.push(`is_read = FALSE`);
  }
  const result = await pool.query<NotificationRow>(
    `SELECT * FROM orycms_notifications WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 100`,
    values,
  );
  return result.rows.map(rowToNotification);
}

export async function getOryCMSUnreadNotificationCount(
  userId: string,
  pool: Pool = getOryCMSPool(),
): Promise<number> {
  await ensureTable(pool);
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM orycms_notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId],
  );
  return parseInt(result.rows[0]?.count ?? "0", 10) || 0;
}

export async function createOryCMSNotification(
  input: OryCMSNotificationInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSNotificationRecord> {
  await ensureTable(pool);
  const result = await pool.query<NotificationRow>(
    `INSERT INTO orycms_notifications (user_id, type, title, body, actor_id, actor_name, project_id, task_id, link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.userId,
      input.type,
      input.title,
      input.body ?? null,
      input.actorId ?? null,
      input.actorName ?? null,
      input.projectId ?? null,
      input.taskId ?? null,
      input.link ?? null,
    ],
  );
  const notification = rowToNotification(result.rows[0]);
  publishOryCMSNotification(notification);
  return notification;
}

export async function markOryCMSNotificationRead(
  id: string,
  userId: string,
  isRead: boolean,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await ensureTable(pool);
  await pool.query(`UPDATE orycms_notifications SET is_read = $3 WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
    isRead,
  ]);
}

export async function markAllOryCMSNotificationsRead(
  userId: string,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await ensureTable(pool);
  await pool.query(`UPDATE orycms_notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [
    userId,
  ]);
}
