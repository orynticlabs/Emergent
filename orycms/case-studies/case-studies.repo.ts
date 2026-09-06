import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OryCMSCaseStudyResult {
  value: string;
  label: string;
}

export interface OryCMSCaseStudyRecord {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  industry: string | null;
  client: string | null;
  timeline: string | null;
  imageUrl: string | null;
  description: string | null;
  challenge: string | null;
  approach: string[];
  results: OryCMSCaseStudyResult[];
  tags: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSCaseStudyInput {
  slug: string;
  title: string;
  category?: string | null;
  industry?: string | null;
  client?: string | null;
  timeline?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  challenge?: string | null;
  approach?: string[];
  results?: OryCMSCaseStudyResult[];
  tags?: string[];
  active?: boolean;
  sortOrder?: number;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_case_studies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  category    TEXT,
  industry    TEXT,
  client      TEXT,
  timeline    TEXT,
  image_url   TEXT,
  description TEXT,
  challenge   TEXT,
  approach    JSONB NOT NULL DEFAULT '[]',
  results     JSONB NOT NULL DEFAULT '[]',
  tags        JSONB NOT NULL DEFAULT '[]',
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_case_studies_active ON orycms_case_studies (active, sort_order);
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

/** Postgres unique-violation error code. */
const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === UNIQUE_VIOLATION;
}

function throwSlugConflict(): never {
  throw Object.assign(new Error("A case study with this slug already exists."), {
    code: "VALIDATION_ERROR",
    statusCode: 422,
    field: "slug",
  });
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface CaseStudyRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  industry: string | null;
  client: string | null;
  timeline: string | null;
  image_url: string | null;
  description: string | null;
  challenge: string | null;
  approach: string[];
  results: OryCMSCaseStudyResult[];
  tags: string[];
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function rowToCaseStudy(row: CaseStudyRow): OryCMSCaseStudyRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    industry: row.industry,
    client: row.client,
    timeline: row.timeline,
    imageUrl: row.image_url,
    description: row.description,
    challenge: row.challenge,
    approach: row.approach ?? [],
    results: row.results ?? [],
    tags: row.tags ?? [],
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSCaseStudies(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCaseStudyRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<CaseStudyRow>(
    `SELECT * FROM orycms_case_studies ORDER BY sort_order ASC, created_at ASC`,
  );
  return result.rows.map(rowToCaseStudy);
}

/** Active case studies only, for a future public marketing-site fetch. */
export async function listActiveOryCMSCaseStudies(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCaseStudyRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<CaseStudyRow>(
    `SELECT * FROM orycms_case_studies WHERE active = TRUE ORDER BY sort_order ASC, created_at ASC`,
  );
  return result.rows.map(rowToCaseStudy);
}

export async function getOryCMSCaseStudy(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCaseStudyRecord> {
  await ensureTables(pool);
  const result = await pool.query<CaseStudyRow>(`SELECT * FROM orycms_case_studies WHERE id = $1`, [id]);
  const row = result.rows[0];
  if (!row) throw new OryCMSAuthError("UNAUTHORIZED", "Case study not found.", 404);
  return rowToCaseStudy(row);
}

export async function createOryCMSCaseStudy(
  input: OryCMSCaseStudyInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCaseStudyRecord> {
  await ensureTables(pool);
  try {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO orycms_case_studies
        (slug, title, category, industry, client, timeline, image_url, description, challenge, approach, results, tags, active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        input.slug,
        input.title,
        input.category ?? null,
        input.industry ?? null,
        input.client ?? null,
        input.timeline ?? null,
        input.imageUrl ?? null,
        input.description ?? null,
        input.challenge ?? null,
        JSON.stringify(input.approach ?? []),
        JSON.stringify(input.results ?? []),
        JSON.stringify(input.tags ?? []),
        input.active ?? true,
        input.sortOrder ?? 0,
      ],
    );
    return getOryCMSCaseStudy(result.rows[0].id, pool);
  } catch (err) {
    if (isUniqueViolation(err)) throwSlugConflict();
    throw err;
  }
}

export async function updateOryCMSCaseStudy(
  id: string,
  input: Partial<OryCMSCaseStudyInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSCaseStudyRecord> {
  await ensureTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const jsonFields = new Set(["approach", "results", "tags"]);
  const fieldMap: Record<string, unknown> = {
    slug: input.slug,
    title: input.title,
    category: input.category,
    industry: input.industry,
    client: input.client,
    timeline: input.timeline,
    image_url: input.imageUrl,
    description: input.description,
    challenge: input.challenge,
    approach: input.approach,
    results: input.results,
    tags: input.tags,
    active: input.active,
    sort_order: input.sortOrder,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(jsonFields.has(column) ? JSON.stringify(value) : value);
    }
  }
  if (sets.length === 0) return getOryCMSCaseStudy(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE orycms_case_studies SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
      values,
    );
    if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Case study not found.", 404);
    return getOryCMSCaseStudy(id, pool);
  } catch (err) {
    if (isUniqueViolation(err)) throwSlugConflict();
    throw err;
  }
}

export async function deleteOryCMSCaseStudy(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_case_studies WHERE id = $1`, [id]);
}
