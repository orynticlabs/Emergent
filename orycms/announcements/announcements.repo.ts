import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

/** Badge color - mapped to the marketing site's brand tokens, not raw CSS. */
export type OryCMSAnnouncementColor = "orange" | "blue" | "neutral";

export interface OryCMSAnnouncementRecord {
  id: string;
  tag: string;
  color: OryCMSAnnouncementColor;
  message: string;
  link: string | null;
  ctaLabel: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSAnnouncementInput {
  tag: string;
  color?: OryCMSAnnouncementColor;
  message: string;
  link?: string | null;
  ctaLabel?: string | null;
  active?: boolean;
  sortOrder?: number;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag         TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'orange',
  message     TEXT NOT NULL,
  link        TEXT,
  cta_label   TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_announcements_active ON orycms_announcements (active, sort_order);
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface AnnouncementRow {
  id: string;
  tag: string;
  color: OryCMSAnnouncementColor;
  message: string;
  link: string | null;
  cta_label: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function rowToAnnouncement(row: AnnouncementRow): OryCMSAnnouncementRecord {
  return {
    id: row.id,
    tag: row.tag,
    color: row.color,
    message: row.message,
    link: row.link,
    ctaLabel: row.cta_label,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listOryCMSAnnouncements(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSAnnouncementRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<AnnouncementRow>(
    `SELECT * FROM orycms_announcements ORDER BY sort_order ASC, created_at DESC`,
  );
  return result.rows.map(rowToAnnouncement);
}

/** Active announcements only, for the public marketing-site fetch. */
export async function listActiveOryCMSAnnouncements(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSAnnouncementRecord[]> {
  await ensureTables(pool);
  const result = await pool.query<AnnouncementRow>(
    `SELECT * FROM orycms_announcements WHERE active = TRUE ORDER BY sort_order ASC, created_at DESC`,
  );
  return result.rows.map(rowToAnnouncement);
}

export async function getOryCMSAnnouncement(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSAnnouncementRecord> {
  await ensureTables(pool);
  const result = await pool.query<AnnouncementRow>(
    `SELECT * FROM orycms_announcements WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) throw new OryCMSAuthError("UNAUTHORIZED", "Announcement not found.", 404);
  return rowToAnnouncement(row);
}

export async function createOryCMSAnnouncement(
  input: OryCMSAnnouncementInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSAnnouncementRecord> {
  await ensureTables(pool);
  const result = await pool.query<{ id: string }>(
    `INSERT INTO orycms_announcements (tag, color, message, link, cta_label, active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      input.tag,
      input.color ?? "orange",
      input.message,
      input.link ?? null,
      input.ctaLabel ?? null,
      input.active ?? true,
      input.sortOrder ?? 0,
    ],
  );
  return getOryCMSAnnouncement(result.rows[0].id, pool);
}

export async function updateOryCMSAnnouncement(
  id: string,
  input: Partial<OryCMSAnnouncementInput>,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSAnnouncementRecord> {
  await ensureTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    tag: input.tag,
    color: input.color,
    message: input.message,
    link: input.link,
    cta_label: input.ctaLabel,
    active: input.active,
    sort_order: input.sortOrder,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return getOryCMSAnnouncement(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);
  const result = await pool.query(
    `UPDATE orycms_announcements SET ${sets.join(", ")} WHERE id = $${i} RETURNING id`,
    values,
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Announcement not found.", 404);
  return getOryCMSAnnouncement(id, pool);
}

export async function deleteOryCMSAnnouncement(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_announcements WHERE id = $1`, [id]);
}
