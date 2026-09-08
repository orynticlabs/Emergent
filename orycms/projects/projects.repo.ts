import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";
import { ORYCMS_SUPER_ADMIN_ROLE } from "@/rbac";
import { addOryCMSProjectMember } from "./project-members.repo";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";

export interface OryCMSProjectRecord {
  id: string;
  name: string;
  description: string | null;
  status: OryCMSProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  ownerId: string | null;
  ownerName: string | null;
  clientId: string | null;
  clientName: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  doneTaskCount: number;
}

export interface OryCMSProjectInput {
  name: string;
  description?: string | null;
  status?: OryCMSProjectStatus;
  startDate?: string | null;
  dueDate?: string | null;
  ownerId?: string | null;
  clientId?: string | null;
}

/**
 * "Super Admin" is the one role that bypasses per-project scoping and sees
 * every project; every other role (Admin included) only sees/accesses
 * projects it's a member of (see orycms_project_members). Kept as a literal
 * string match rather than a permission check because this is a row-level
 * visibility rule, not a resource-level permission - a role can have
 * `projects:manage` and still be scoped to its assigned projects.
 * ORYCMS_SUPER_ADMIN_ROLE is the single shared source for this name - see
 * its doc comment in orycms/rbac/rbac.engine.ts.
 */
const SUPER_ADMIN_ROLE = ORYCMS_SUPER_ADMIN_ROLE;

export interface OryCMSProjectViewer {
  userId: string;
  roleName: string | null;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'planning',
  start_date    DATE,
  due_date      DATE,
  owner_id      UUID REFERENCES orycms_users(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES orycms_users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- client_id has no FK constraint: orycms_clients may not exist yet the first
-- time this table is created (module load order isn't guaranteed), and the
-- relationship is enforced at the application layer instead.
ALTER TABLE orycms_projects ADD COLUMN IF NOT EXISTS client_id UUID;
CREATE INDEX IF NOT EXISTS idx_op_status ON orycms_projects (status);
CREATE INDEX IF NOT EXISTS idx_op_owner  ON orycms_projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_op_client ON orycms_projects (client_id);

CREATE TABLE IF NOT EXISTS orycms_project_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES orycms_projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'todo',
  priority      TEXT NOT NULL DEFAULT 'medium',
  assignee_id   UUID REFERENCES orycms_users(id) ON DELETE SET NULL,
  due_date      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- type (task/bug/feature/milestone) and parent_id (self-referential, for
-- work-package hierarchy) were added after the table's first release, so they
-- go through ALTER TABLE ADD COLUMN IF NOT EXISTS like orycms_projects.client_id.
ALTER TABLE orycms_project_tasks ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'task';
ALTER TABLE orycms_project_tasks ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES orycms_project_tasks(id) ON DELETE CASCADE;
ALTER TABLE orycms_project_tasks ADD COLUMN IF NOT EXISTS start_date DATE;
CREATE INDEX IF NOT EXISTS idx_opt_project  ON orycms_project_tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_opt_assignee ON orycms_project_tasks (assignee_id);
CREATE INDEX IF NOT EXISTS idx_opt_status   ON orycms_project_tasks (status);
CREATE INDEX IF NOT EXISTS idx_opt_parent   ON orycms_project_tasks (parent_id);

-- Per-project membership, additive to the global role system: a project
-- member has a role scoped to that project (manager/member/viewer), used for
-- team visibility and as an assignee pool. It does not gate access on its
-- own - global RBAC (the "projects" resource) still governs who can read or
-- edit a project at all.
CREATE TABLE IF NOT EXISTS orycms_project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES orycms_projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES orycms_users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_opm_project ON orycms_project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_opm_user    ON orycms_project_members (user_id);

-- Directed relation between two tasks. "blocks" reads task_id -> blocks ->
-- related_task_id (i.e. task_id must finish before related_task_id can
-- start); "relates_to" and "duplicates" are informational. The inverse view
-- ("blocked by", "duplicated by") is computed at query time rather than
-- stored as a second row.
CREATE TABLE IF NOT EXISTS orycms_task_relations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          UUID NOT NULL REFERENCES orycms_project_tasks(id) ON DELETE CASCADE,
  related_task_id  UUID NOT NULL REFERENCES orycms_project_tasks(id) ON DELETE CASCADE,
  type             TEXT NOT NULL DEFAULT 'relates_to',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, related_task_id, type),
  CHECK (task_id <> related_task_id)
);
CREATE INDEX IF NOT EXISTS idx_otr_task    ON orycms_task_relations (task_id);
CREATE INDEX IF NOT EXISTS idx_otr_related ON orycms_task_relations (related_task_id);
`;

/** Exported so other modules (e.g. clients.repo.ts, which joins on orycms_projects) can guarantee ordering. */
export async function ensureOryCMSProjectTables(pool: Pool = getOryCMSPool()): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: OryCMSProjectStatus;
  start_date: string | null;
  due_date: string | null;
  owner_id: string | null;
  owner_name: string | null;
  client_id: string | null;
  client_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  task_count: string;
  done_task_count: string;
}

function rowToProject(row: ProjectRow): OryCMSProjectRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    startDate: row.start_date,
    dueDate: row.due_date,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    clientId: row.client_id,
    clientName: row.client_name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    taskCount: parseInt(row.task_count, 10) || 0,
    doneTaskCount: parseInt(row.done_task_count, 10) || 0,
  };
}

const PROJECT_SELECT = `
  SELECT
    p.id, p.name, p.description, p.status, p.start_date, p.due_date,
    p.owner_id, u.name AS owner_name, p.client_id, c.name AS client_name,
    p.created_by, p.created_at, p.updated_at,
    COUNT(t.id) AS task_count,
    COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_task_count
  FROM orycms_projects p
  LEFT JOIN orycms_users u ON u.id = p.owner_id
  LEFT JOIN orycms_clients c ON c.id = p.client_id
  LEFT JOIN orycms_project_tasks t ON t.project_id = p.id
`;

// ── Public API ────────────────────────────────────────────────────────────────

/** Appends a membership-scoping WHERE clause for non-Super-Admin viewers. Returns the clause (possibly empty) and the params it consumed, starting at $paramOffset. */
function scopeClause(viewer: OryCMSProjectViewer, paramOffset: number): { sql: string; params: unknown[] } {
  if (viewer.roleName === SUPER_ADMIN_ROLE) return { sql: "", params: [] };
  return {
    sql: `EXISTS (SELECT 1 FROM orycms_project_members m WHERE m.project_id = p.id AND m.user_id = $${paramOffset})`,
    params: [viewer.userId],
  };
}

export async function listOryCMSProjects(
  viewer: OryCMSProjectViewer,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectRecord[]> {
  await ensureOryCMSProjectTables(pool);
  const scope = scopeClause(viewer, 1);
  const where = scope.sql ? `WHERE ${scope.sql}` : "";
  const result = await pool.query<ProjectRow>(
    `${PROJECT_SELECT} ${where} GROUP BY p.id, u.name, c.name ORDER BY p.created_at DESC`,
    scope.params,
  );
  return result.rows.map(rowToProject);
}

export async function listOryCMSProjectsByClient(
  viewer: OryCMSProjectViewer,
  clientId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectRecord[]> {
  await ensureOryCMSProjectTables(pool);
  const scope = scopeClause(viewer, 2);
  const where = scope.sql ? `AND ${scope.sql}` : "";
  const result = await pool.query<ProjectRow>(
    `${PROJECT_SELECT} WHERE p.client_id = $1 ${where} GROUP BY p.id, u.name, c.name ORDER BY p.created_at DESC`,
    [clientId, ...scope.params],
  );
  return result.rows.map(rowToProject);
}

/** Throws FORBIDDEN unless the viewer is a Super Admin or a member of the project. */
export async function assertOryCMSProjectAccess(
  viewer: OryCMSProjectViewer,
  projectId: string,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  if (viewer.roleName === SUPER_ADMIN_ROLE) return;
  const result = await pool.query(
    `SELECT 1 FROM orycms_project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, viewer.userId],
  );
  if ((result.rowCount ?? 0) === 0) {
    throw new OryCMSAuthError("FORBIDDEN", "You don't have access to this project.", 403);
  }
}

export async function getOryCMSProject(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectRecord> {
  await ensureOryCMSProjectTables(pool);
  const result = await pool.query<ProjectRow>(
    `${PROJECT_SELECT} WHERE p.id = $1 GROUP BY p.id, u.name, c.name`,
    [id],
  );
  const project = result.rows[0];
  if (!project) throw new OryCMSAuthError("UNAUTHORIZED", "Project not found.", 404);
  return rowToProject(project);
}

export async function createOryCMSProject(
  input: OryCMSProjectInput,
  createdBy: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectRecord> {
  await ensureOryCMSProjectTables(pool);
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_projects (name, description, status, start_date, due_date, owner_id, client_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.name,
      input.description ?? null,
      input.status ?? "planning",
      input.startDate ?? null,
      input.dueDate ?? null,
      input.ownerId ?? null,
      input.clientId ?? null,
      createdBy,
    ],
  );
  // The creator wouldn't otherwise be able to see their own project once
  // scoping kicks in (unless they're a Super Admin), so they're added as
  // its first member automatically.
  await addOryCMSProjectMember(result.rows[0].id, createdBy, "manager", pool);
  return getOryCMSProject(result.rows[0].id, pool);
}

export async function updateOryCMSProject(
  id: string,
  input: Partial<OryCMSProjectInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectRecord> {
  await ensureOryCMSProjectTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    name: input.name,
    description: input.description,
    status: input.status,
    start_date: input.startDate,
    due_date: input.dueDate,
    owner_id: input.ownerId,
    client_id: input.clientId,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return getOryCMSProject(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);
  const result = await pool.query(
    `UPDATE orycms_projects SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
    values,
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Project not found.", 404);
  return getOryCMSProject(id, pool);
}

export async function deleteOryCMSProject(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureOryCMSProjectTables(pool);
  await pool.query(`DELETE FROM orycms_projects WHERE id = $1`, [id]);
}
