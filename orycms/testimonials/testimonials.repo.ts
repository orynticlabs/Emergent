import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OryCMSTestimonialRecord {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSTestimonialInput {
  name: string;
  role?: string | null;
  quote: string;
  imageUrl?: string | null;
  active?: boolean;
  sortOrder?: number;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT,
  quote       TEXT NOT NULL,
  image_url   TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_testimonials_active ON orycms_testimonials (active, sort_order);
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface TestimonialRow {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function rowToTestimonial(row: TestimonialRow): OryCMSTestimonialRecord {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    quote: row.quote,
    imageUrl: row.image_url,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSTestimonials(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTestimonialRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<TestimonialRow>(
    `SELECT * FROM orycms_testimonials ORDER BY sort_order ASC, created_at ASC`,
  );
  return result.rows.map(rowToTestimonial);
}

/** Active testimonials only, for the marketing site's public fetch. */
export async function listActiveOryCMSTestimonials(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTestimonialRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<TestimonialRow>(
    `SELECT * FROM orycms_testimonials WHERE active = TRUE ORDER BY sort_order ASC, created_at ASC`,
  );
  return result.rows.map(rowToTestimonial);
}

export async function getOryCMSTestimonial(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTestimonialRecord> {
  await ensureTables(pool);
  const result = await pool.query<TestimonialRow>(`SELECT * FROM orycms_testimonials WHERE id = $1`, [id]);
  const row = result.rows[0];
  if (!row) throw new OryCMSAuthError("UNAUTHORIZED", "Testimonial not found.", 404);
  return rowToTestimonial(row);
}

export async function createOryCMSTestimonial(
  input: OryCMSTestimonialInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTestimonialRecord> {
  await ensureTables(pool);
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_testimonials (name, role, quote, image_url, active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      input.name,
      input.role ?? null,
      input.quote,
      input.imageUrl ?? null,
      input.active ?? true,
      input.sortOrder ?? 0,
    ],
  );
  return getOryCMSTestimonial(result.rows[0].id, pool);
}

export async function updateOryCMSTestimonial(
  id: string,
  input: Partial<OryCMSTestimonialInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSTestimonialRecord> {
  await ensureTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    name: input.name,
    role: input.role,
    quote: input.quote,
    image_url: input.imageUrl,
    active: input.active,
    sort_order: input.sortOrder,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return getOryCMSTestimonial(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE orycms_testimonials SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
    values,
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Testimonial not found.", 404);
  return getOryCMSTestimonial(id, pool);
}

export async function deleteOryCMSTestimonial(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_testimonials WHERE id = $1`, [id]);
}
