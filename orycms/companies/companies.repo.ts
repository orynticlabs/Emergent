import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OryCMSCompanyRecord {
  id: string;
  name: string;
  logoUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSCompanyInput {
  name: string;
  logoUrl?: string | null;
  active?: boolean;
  sortOrder?: number;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  logo_url    TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_companies_active ON orycms_companies (active, sort_order);
-- Migrates tables created before the switch from text-styled wordmarks to
-- uploaded logo images (the old style_class column is left in place, unused).
ALTER TABLE orycms_companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface CompanyRow {
  id: string;
  name: string;
  logo_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function rowToCompany(row: CompanyRow): OryCMSCompanyRecord {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSCompanies(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCompanyRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<CompanyRow>(
    `SELECT * FROM orycms_companies ORDER BY sort_order ASC, created_at ASC`,
  );
  return result.rows.map(rowToCompany);
}

/** Active companies only, for the public marquee fetch. */
export async function listActiveOryCMSCompanies(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCompanyRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<CompanyRow>(
    `SELECT * FROM orycms_companies WHERE active = TRUE ORDER BY sort_order ASC, created_at ASC`,
  );
  return result.rows.map(rowToCompany);
}

export async function getOryCMSCompany(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCompanyRecord> {
  await ensureTables(pool);
  const result = await pool.query<CompanyRow>(`SELECT * FROM orycms_companies WHERE id = $1`, [id]);
  const row = result.rows[0];
  if (!row) throw new OryCMSAuthError("UNAUTHORIZED", "Company not found.", 404);
  return rowToCompany(row);
}

export async function createOryCMSCompany(
  input: OryCMSCompanyInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCompanyRecord> {
  await ensureTables(pool);
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_companies (name, logo_url, active, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.name, input.logoUrl ?? null, input.active ?? true, input.sortOrder ?? 0],
  );
  return getOryCMSCompany(result.rows[0].id, pool);
}

export async function updateOryCMSCompany(
  id: string,
  input: Partial<OryCMSCompanyInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCompanyRecord> {
  await ensureTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    name: input.name,
    logo_url: input.logoUrl,
    active: input.active,
    sort_order: input.sortOrder,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return getOryCMSCompany(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);
  const result = await pool.query(
    `UPDATE orycms_companies SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
    values,
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Company not found.", 404);
  return getOryCMSCompany(id, pool);
}

export async function deleteOryCMSCompany(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_companies WHERE id = $1`, [id]);
}
