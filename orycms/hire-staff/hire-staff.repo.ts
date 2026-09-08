import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSHireStaffRequestStatus = "new" | "contacted" | "closed";

export interface OryCMSHireStaffRequestRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string | null;
  engagementModel: string | null;
  teamSize: string | null;
  timeline: string | null;
  message: string | null;
  status: OryCMSHireStaffRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSHireStaffRequestInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  engagementModel?: string | null;
  teamSize?: string | null;
  timeline?: string | null;
  message?: string | null;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_hire_staff_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  company           TEXT,
  role              TEXT,
  engagement_model  TEXT,
  team_size         TEXT,
  timeline          TEXT,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'new',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_hire_staff_requests_status ON orycms_hire_staff_requests (status, created_at);
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface HireStaffRequestRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string | null;
  engagement_model: string | null;
  team_size: string | null;
  timeline: string | null;
  message: string | null;
  status: OryCMSHireStaffRequestStatus;
  created_at: string;
  updated_at: string;
}

function rowToHireStaffRequest(row: HireStaffRequestRow): OryCMSHireStaffRequestRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    role: row.role,
    engagementModel: row.engagement_model,
    teamSize: row.team_size,
    timeline: row.timeline,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Newest first - an admin triaging a leads inbox wants to see what just came in. */
export async function listOryCMSHireStaffRequests(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSHireStaffRequestRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<HireStaffRequestRow>(
    `SELECT * FROM orycms_hire_staff_requests ORDER BY created_at DESC`,
  );
  return result.rows.map(rowToHireStaffRequest);
}

export async function getOryCMSHireStaffRequest(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSHireStaffRequestRecord> {
  await ensureTables(pool);
  const result = await pool.query<HireStaffRequestRow>(
    `SELECT * FROM orycms_hire_staff_requests WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) throw new OryCMSAuthError("UNAUTHORIZED", "Hire staff request not found.", 404);
  return rowToHireStaffRequest(row);
}

/** Called from the public /hire-staff form - no session, so no actor to attribute the row to. */
export async function createOryCMSHireStaffRequest(
  input: OryCMSHireStaffRequestInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSHireStaffRequestRecord> {
  await ensureTables(pool);
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_hire_staff_requests
      (name, email, phone, company, role, engagement_model, team_size, timeline, message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      input.name,
      input.email,
      input.phone ?? null,
      input.company ?? null,
      input.role ?? null,
      input.engagementModel ?? null,
      input.teamSize ?? null,
      input.timeline ?? null,
      input.message ?? null,
    ],
  );
  return getOryCMSHireStaffRequest(result.rows[0].id, pool);
}

/** The only field an admin ever changes on a submitted request - everything else is what the visitor sent. */
export async function updateOryCMSHireStaffRequestStatus(
  id: string,
  status: OryCMSHireStaffRequestStatus,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSHireStaffRequestRecord> {
  await ensureTables(pool);
  const result = await pool.query(
    `UPDATE orycms_hire_staff_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
    [status, id],
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Hire staff request not found.", 404);
  return getOryCMSHireStaffRequest(id, pool);
}

export async function deleteOryCMSHireStaffRequest(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_hire_staff_requests WHERE id = $1`, [id]);
}
