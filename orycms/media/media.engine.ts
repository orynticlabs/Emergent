import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSMediaError } from "./media.errors";
import type { OryCMSMediaAsset, OryCMSMediaType } from "@/types";
import { buildOryCMSHookContext, runOryCMSBeforeHooks, runOryCMSAfterHooks } from "@/hooks";
import {
  getOryCMSStorageAdapter,
  getOryCMSStorageAdapterByName,
  resolveOryCMSStorageProvider,
} from "./storage/storage.factory";

const MEDIA_COLLECTION = "orycms_media";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function mediaTypeFrom(mime: string): OryCMSMediaType {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

// ── Image dimension parser (no deps) ─────────────────────────────────────────

function imageDimensions(buf: Buffer, mime: string): { width: number; height: number } | null {
  try {
    if (mime === "image/png" && buf.length >= 24) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xc3) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (mime === "image/gif" && buf.length >= 10) {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (mime === "image/webp" && buf.length >= 30) {
      const chunk = buf.slice(12, 16).toString("ascii");
      if (chunk === "VP8 ") {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      }
      if (chunk === "VP8L") {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
  } catch {
    // best-effort
  }
  return null;
}

// ── DB schema ─────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  media_type    TEXT NOT NULL,
  size          INTEGER NOT NULL,
  width         INTEGER,
  height        INTEGER,
  url           TEXT NOT NULL,
  file_path     TEXT NOT NULL,
  uploaded_by   TEXT,
  alt_text      TEXT,
  caption       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- storage_provider records which OryCMSStorageAdapter produced this asset
-- (see media/storage/*), so deleteOryCMSMedia knows which adapter to route
-- the delete through even if ORYCMS_STORAGE_PROVIDER changes later.
-- file_path is now a generic opaque storage reference (local file path,
-- or "resourceType:publicId" for Cloudinary) - not necessarily a filesystem path.
ALTER TABLE orycms_media ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'local';
CREATE INDEX IF NOT EXISTS idx_om_type    ON orycms_media (media_type);
CREATE INDEX IF NOT EXISTS idx_om_name    ON orycms_media (name);
CREATE INDEX IF NOT EXISTS idx_om_created ON orycms_media (created_at DESC);
`;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface MediaRow {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  media_type: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  file_path: string;
  storage_provider: string;
  uploaded_by: string | null;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

function rowToAsset(row: MediaRow): OryCMSMediaAsset {
  return {
    id: row.id,
    name: row.name,
    alternativeText: row.alt_text ?? undefined,
    caption: row.caption ?? undefined,
    url: row.url,
    mimeType: row.mime_type,
    type: row.media_type as OryCMSMediaType,
    size: row.size,
    dimensions:
      row.width != null && row.height != null
        ? { width: row.width, height: row.height }
        : undefined,
    uploadedBy: row.uploaded_by ?? undefined,
    timestamps: { createdAt: String(row.created_at), updatedAt: String(row.updated_at) },
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface OryCMSMediaUploadInput {
  buffer: Buffer;
  name: string;
  mimeType: string;
  size: number;
}

export interface OryCMSMediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: "name" | "size" | "created_at";
  dir?: "asc" | "desc";
}

export interface OryCMSMediaListResult {
  data: OryCMSMediaAsset[];
  meta: { total: number; page: number; limit: number; hasMore: boolean };
}

export async function uploadOryCMSMedia(
  input: OryCMSMediaUploadInput,
  uploadedBy: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMediaAsset> {
  await ensureTables(pool);

  if (!ALLOWED_TYPES.has(input.mimeType)) {
    throw new OryCMSMediaError(
      "MEDIA_TYPE_NOT_ALLOWED",
      `File type "${input.mimeType}" is not allowed.`,
      415,
    );
  }
  if (input.size > MAX_SIZE) {
    throw new OryCMSMediaError("MEDIA_TOO_LARGE", `File exceeds the 50 MB limit.`, 413);
  }

  await runOryCMSBeforeHooks(
    "beforeUpload",
    buildOryCMSHookContext(
      "beforeUpload",
      MEDIA_COLLECTION,
      { name: input.name, mimeType: input.mimeType, size: input.size },
      null,
    ),
  );

  const storageProvider = resolveOryCMSStorageProvider();
  const storage = getOryCMSStorageAdapter();

  let uploaded: { url: string; ref: string };
  try {
    uploaded = await storage.upload({
      buffer: input.buffer,
      filename: input.name,
      mimeType: input.mimeType,
    });
  } catch (err) {
    throw new OryCMSMediaError(
      "MEDIA_UPLOAD_FAILED",
      `Failed to store file: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }

  const dims =
    mediaTypeFrom(input.mimeType) === "image"
      ? imageDimensions(input.buffer, input.mimeType)
      : null;

  const res = await pool.query<{ id: string }>(
    `INSERT INTO orycms_media
       (name, original_name, mime_type, media_type, size, width, height, url, file_path, storage_provider, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id`,
    [
      input.name,
      input.name,
      input.mimeType,
      mediaTypeFrom(input.mimeType),
      input.size,
      dims?.width ?? null,
      dims?.height ?? null,
      uploaded.url,
      uploaded.ref,
      storageProvider,
      uploadedBy,
    ],
  );

  const row = await pool.query<MediaRow>(`SELECT * FROM orycms_media WHERE id = $1`, [
    res.rows[0].id,
  ]);
  const asset = rowToAsset(row.rows[0]);

  await runOryCMSAfterHooks(
    "afterUpload",
    buildOryCMSHookContext(
      "afterUpload",
      MEDIA_COLLECTION,
      asset as unknown as Record<string, unknown>,
      null,
    ),
  );
  return asset;
}

export async function listOryCMSMedia(
  params: OryCMSMediaListParams = {},
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMediaListResult> {
  await ensureTables(pool);

  const { page = 1, limit = 20, search, type, sort = "created_at", dir = "desc" } = params;

  const SORT_FIELDS = new Set(["name", "size", "created_at"]);
  const sortField = SORT_FIELDS.has(sort) ? sort : "created_at";
  const direction = dir === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }
  if (type) {
    conditions.push(`media_type = $${idx++}`);
    values.push(type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM orycms_media ${where}`,
    values,
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const rows = await pool.query<MediaRow>(
    `SELECT * FROM orycms_media ${where} ORDER BY ${sortField} ${direction} LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset],
  );

  return {
    data: rows.rows.map(rowToAsset),
    meta: { total, page, limit, hasMore: page * limit < total },
  };
}

export async function getOryCMSMedia(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMediaAsset> {
  await ensureTables(pool);
  const res = await pool.query<MediaRow>(`SELECT * FROM orycms_media WHERE id = $1`, [id]);
  if (!res.rows[0]) {
    throw new OryCMSMediaError("MEDIA_NOT_FOUND", `Media asset "${id}" not found.`, 404);
  }
  return rowToAsset(res.rows[0]);
}

export interface OryCMSMediaUpdateInput {
  name?: string;
  altText?: string;
  caption?: string;
}

export async function updateOryCMSMedia(
  id: string,
  input: OryCMSMediaUpdateInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSMediaAsset> {
  await ensureTables(pool);

  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (input.name !== undefined) {
    sets.push(`name = $${idx++}`);
    values.push(input.name);
  }
  if (input.altText !== undefined) {
    sets.push(`alt_text = $${idx++}`);
    values.push(input.altText);
  }
  if (input.caption !== undefined) {
    sets.push(`caption = $${idx++}`);
    values.push(input.caption);
  }

  if (sets.length === 0) return getOryCMSMedia(id, pool);

  sets.push(`updated_at = NOW()`);
  values.push(id);

  await pool.query(`UPDATE orycms_media SET ${sets.join(", ")} WHERE id = $${idx}`, values);

  return getOryCMSMedia(id, pool);
}

export async function deleteOryCMSMedia(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);

  const res = await pool.query<{ file_path: string; storage_provider: string }>(
    `SELECT file_path, storage_provider FROM orycms_media WHERE id = $1`,
    [id],
  );
  if (!res.rows[0]) {
    throw new OryCMSMediaError("MEDIA_NOT_FOUND", `Media asset "${id}" not found.`, 404);
  }

  await runOryCMSBeforeHooks(
    "beforeMediaDelete",
    buildOryCMSHookContext(
      "beforeMediaDelete",
      MEDIA_COLLECTION,
      { id, filePath: res.rows[0].file_path },
      null,
    ),
  );

  try {
    const storage = getOryCMSStorageAdapterByName(res.rows[0].storage_provider);
    await storage.delete(res.rows[0].file_path);
  } catch {
    // best-effort - don't block the DB delete on a storage-side failure
  }

  await pool.query(`DELETE FROM orycms_media WHERE id = $1`, [id]);

  await runOryCMSAfterHooks(
    "afterMediaDelete",
    buildOryCMSHookContext("afterMediaDelete", MEDIA_COLLECTION, { id }, null),
  );
}
