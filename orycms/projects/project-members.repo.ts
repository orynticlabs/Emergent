import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSProjectMemberRole = "manager" | "member" | "viewer";

export interface OryCMSProjectMemberRecord {
  id: string;
  projectId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  role: OryCMSProjectMemberRole;
  addedAt: string;
}

interface MemberRow {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string;
  role: OryCMSProjectMemberRole;
  added_at: string;
}

function rowToMember(row: MemberRow): OryCMSProjectMemberRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    role: row.role,
    addedAt: row.added_at,
  };
}

const MEMBER_SELECT = `
  SELECT m.id, m.project_id, m.user_id, u.name AS user_name, u.email AS user_email, m.role, m.added_at
  FROM orycms_project_members m
  JOIN orycms_users u ON u.id = m.user_id
`;

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSProjectMembers(
  projectId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectMemberRecord[]> {
  const result = await pool.query<MemberRow>(
    `${MEMBER_SELECT} WHERE m.project_id = $1 ORDER BY m.added_at ASC`,
    [projectId],
  );
  return result.rows.map(rowToMember);
}

export async function addOryCMSProjectMember(
  projectId: string,
  userId: string,
  role: OryCMSProjectMemberRole = "member",
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectMemberRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_project_members (project_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
     RETURNING id`,
    [projectId, userId, role],
  );
  const row = await pool.query<MemberRow>(`${MEMBER_SELECT} WHERE m.id = $1`, [result.rows[0].id]);
  return rowToMember(row.rows[0]);
}

export async function updateOryCMSProjectMemberRole(
  projectId: string,
  userId: string,
  role: OryCMSProjectMemberRole,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSProjectMemberRecord> {
  const result = await pool.query<{ id: string }>(
    `UPDATE orycms_project_members SET role = $3 WHERE project_id = $1 AND user_id = $2 RETURNING id`,
    [projectId, userId, role],
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Project member not found.", 404);
  const row = await pool.query<MemberRow>(`${MEMBER_SELECT} WHERE m.id = $1`, [result.rows[0].id]);
  return rowToMember(row.rows[0]);
}

export async function removeOryCMSProjectMember(
  projectId: string,
  userId: string,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await pool.query(`DELETE FROM orycms_project_members WHERE project_id = $1 AND user_id = $2`, [
    projectId,
    userId,
  ]);
}
