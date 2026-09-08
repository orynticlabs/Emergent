import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Lifecycle stage - "onboarding" covers everything from signed contract to
 * first delivery going live; "active" is an ongoing engagement.
 */
export type OryCMSClientStatus = "lead" | "onboarding" | "active" | "inactive" | "churned";

/** Canonical industry list - mirrors the marketing site's INDUSTRIES (app/(site)/_shared/data/content.js). */
export const ORYCMS_CLIENT_INDUSTRIES = [
  "Fintech",
  "Healthcare & Biotech",
  "EdTech",
  "Supply Chain & Logistics",
  "Manufacturing",
  "Agriculture",
  "Retail & E-commerce",
  "Energy & Utilities",
  "Real Estate",
  "Automobile",
  "Hospitality & Food",
  "Other",
] as const;

export interface OryCMSClientRecord {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: OryCMSClientStatus;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  projectCount: number;
}

export interface OryCMSClientInput {
  name: string;
  industry?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status?: OryCMSClientStatus;
  notes?: string | null;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_clients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  industry       TEXT,
  website        TEXT,
  contact_name   TEXT,
  contact_email  TEXT,
  contact_phone  TEXT,
  status         TEXT NOT NULL DEFAULT 'lead',
  notes          TEXT,
  created_by     UUID REFERENCES orycms_users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_status   ON orycms_clients (status);
CREATE INDEX IF NOT EXISTS idx_oc_industry ON orycms_clients (industry);
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface ClientRow {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: OryCMSClientStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  project_count: string;
}

function rowToClient(row: ClientRow): OryCMSClientRecord {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    website: row.website,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    status: row.status,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    projectCount: parseInt(row.project_count, 10) || 0,
  };
}

// `orycms_projects.client_id` is added lazily here (rather than in
// projects.repo.ts) so this module works standalone even if projects.repo's
// ensureTables hasn't run yet in this request.
const CLIENT_SELECT = `
  SELECT
    c.id, c.name, c.industry, c.website, c.contact_name, c.contact_email,
    c.contact_phone, c.status, c.notes, c.created_by, c.created_at, c.updated_at,
    COUNT(p.id) AS project_count
  FROM orycms_clients c
  LEFT JOIN orycms_projects p ON p.client_id = c.id
`;

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSClients(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSClientRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<ClientRow>(
    `${CLIENT_SELECT} GROUP BY c.id ORDER BY c.created_at DESC`,
  );
  return result.rows.map(rowToClient);
}

export async function getOryCMSClient(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSClientRecord> {
  await ensureTables(pool);
  const result = await pool.query<ClientRow>(`${CLIENT_SELECT} WHERE c.id = $1 GROUP BY c.id`, [id]);
  const client = result.rows[0];
  if (!client) throw new OryCMSAuthError("UNAUTHORIZED", "Client not found.", 404);
  return rowToClient(client);
}

export async function createOryCMSClient(
  input: OryCMSClientInput,
  createdBy: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSClientRecord> {
  await ensureTables(pool);
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_clients
       (name, industry, website, contact_name, contact_email, contact_phone, status, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      input.name,
      input.industry ?? null,
      input.website ?? null,
      input.contactName ?? null,
      input.contactEmail ?? null,
      input.contactPhone ?? null,
      input.status ?? "lead",
      input.notes ?? null,
      createdBy,
    ],
  );
  return getOryCMSClient(result.rows[0].id, pool);
}

export async function updateOryCMSClient(
  id: string,
  input: Partial<OryCMSClientInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSClientRecord> {
  await ensureTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    name: input.name,
    industry: input.industry,
    website: input.website,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone,
    status: input.status,
    notes: input.notes,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return getOryCMSClient(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);
  const result = await pool.query(
    `UPDATE orycms_clients SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
    values,
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Client not found.", 404);
  return getOryCMSClient(id, pool);
}

export async function deleteOryCMSClient(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_clients WHERE id = $1`, [id]);
}
