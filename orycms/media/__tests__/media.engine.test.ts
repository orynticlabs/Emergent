import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";

// Mock the storage adapter factory instead of fs — media.engine no longer
// talks to the filesystem directly, it goes through OryCMSStorageAdapter.
const mockUpload = vi.fn();
const mockDelete = vi.fn();

vi.mock("../storage/storage.factory", () => ({
  resolveOryCMSStorageProvider: vi.fn(() => "local"),
  getOryCMSStorageAdapter: vi.fn(() => ({ name: "local", upload: mockUpload, delete: mockDelete })),
  getOryCMSStorageAdapterByName: vi.fn(() => ({
    name: "local",
    upload: mockUpload,
    delete: mockDelete,
  })),
}));

import {
  uploadOryCMSMedia,
  listOryCMSMedia,
  getOryCMSMedia,
  updateOryCMSMedia,
  deleteOryCMSMedia,
} from "../media.engine";
import { OryCMSMediaError } from "../media.errors";

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOW = "2024-01-01T00:00:00.000Z";

function mediaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "media-uuid-001",
    name: "photo.jpg",
    original_name: "photo.jpg",
    mime_type: "image/jpeg",
    media_type: "image",
    size: 12345,
    width: 800,
    height: 600,
    url: "/uploads/uuid-abc.jpg",
    file_path: "/project/public/uploads/uuid-abc.jpg",
    storage_provider: "local",
    uploaded_by: "owner@test.com",
    alt_text: null,
    caption: null,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

function makePool(impl: (sql: string, params?: unknown[]) => unknown): Pool {
  return { query: vi.fn(impl) } as unknown as Pool;
}

// ── uploadOryCMSMedia ─────────────────────────────────────────────────────────

describe("uploadOryCMSMedia", () => {
  beforeEach(() => {
    mockUpload.mockReset();
    mockUpload.mockResolvedValue({
      url: "/uploads/uuid-abc.jpg",
      ref: "/project/public/uploads/uuid-abc.jpg",
    });
  });

  it("stores the file via the storage adapter and inserts DB row for image", async () => {
    let insertCalled = false;
    let callIdx = 0;
    const pool = makePool(() => {
      callIdx++;
      if (callIdx === 1) return { rows: [] }; // ensureTables
      if (callIdx === 2) {
        insertCalled = true;
        return { rows: [{ id: "media-uuid-001" }] }; // INSERT
      }
      return { rows: [mediaRow()] }; // SELECT
    });

    const result = await uploadOryCMSMedia(
      { buffer: Buffer.alloc(100), name: "photo.jpg", mimeType: "image/jpeg", size: 100 },
      "owner@test.com",
      pool,
    );

    expect(insertCalled).toBe(true);
    expect(mockUpload).toHaveBeenCalled();
    expect(result.name).toBe("photo.jpg");
    expect(result.type).toBe("image");
  });

  it("throws MEDIA_TYPE_NOT_ALLOWED for unsupported mime type", async () => {
    const pool = makePool(() => ({ rows: [] }));
    await expect(
      uploadOryCMSMedia(
        {
          buffer: Buffer.alloc(10),
          name: "script.exe",
          mimeType: "application/x-msdownload",
          size: 10,
        },
        "owner@test.com",
        pool,
      ),
    ).rejects.toMatchObject({ code: "MEDIA_TYPE_NOT_ALLOWED", statusCode: 415 });
  });

  it("throws MEDIA_TOO_LARGE when file exceeds 50 MB", async () => {
    const pool = makePool(() => ({ rows: [] }));
    await expect(
      uploadOryCMSMedia(
        {
          buffer: Buffer.alloc(10),
          name: "big.mp4",
          mimeType: "video/mp4",
          size: 51 * 1024 * 1024,
        },
        "owner@test.com",
        pool,
      ),
    ).rejects.toMatchObject({ code: "MEDIA_TOO_LARGE", statusCode: 413 });
  });

  it("throws MEDIA_UPLOAD_FAILED when the storage adapter fails", async () => {
    mockUpload.mockRejectedValueOnce(new Error("disk full"));
    const pool = makePool(() => ({ rows: [] }));
    await expect(
      uploadOryCMSMedia(
        { buffer: Buffer.alloc(10), name: "photo.png", mimeType: "image/png", size: 10 },
        "owner@test.com",
        pool,
      ),
    ).rejects.toMatchObject({ code: "MEDIA_UPLOAD_FAILED", statusCode: 500 });
  });
});

// ── listOryCMSMedia ───────────────────────────────────────────────────────────

describe("listOryCMSMedia", () => {
  it("returns paginated results", async () => {
    let callIdx = 0;
    const pool = makePool(() => {
      callIdx++;
      if (callIdx === 1) return { rows: [] }; // ensureTables
      if (callIdx === 2) return { rows: [{ count: "5" }] }; // COUNT
      return { rows: [mediaRow(), mediaRow({ id: "media-uuid-002" })] }; // SELECT
    });

    const result = await listOryCMSMedia({ page: 1, limit: 20 }, pool);
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(5);
    expect(result.meta.hasMore).toBe(false);
  });

  it("filters by search term (passes ILIKE param)", async () => {
    let likeParam: unknown;
    let callIdx = 0;
    const pool = makePool((_sql: string, params?: unknown[]) => {
      callIdx++;
      if (callIdx === 1) return { rows: [] }; // ensureTables
      if (callIdx === 2) {
        likeParam = params?.[0];
        return { rows: [{ count: "1" }] };
      }
      return { rows: [mediaRow()] };
    });

    await listOryCMSMedia({ search: "photo" }, pool);
    expect(likeParam).toBe("%photo%");
  });

  it("supports sorting by name and size", async () => {
    let sortSql = "";
    let callIdx = 0;
    const pool = makePool((sql: string) => {
      callIdx++;
      if (callIdx === 1) return { rows: [] };
      if (callIdx === 2) return { rows: [{ count: "0" }] };
      sortSql = sql;
      return { rows: [] };
    });

    await listOryCMSMedia({ sort: "size", dir: "asc" }, pool);
    expect(sortSql).toContain("size ASC");
  });
});

// ── getOryCMSMedia ────────────────────────────────────────────────────────────

describe("getOryCMSMedia", () => {
  it("returns a media asset by id", async () => {
    let callIdx = 0;
    const pool = makePool(() => {
      callIdx++;
      if (callIdx === 1) return { rows: [] };
      return { rows: [mediaRow()] };
    });

    const asset = await getOryCMSMedia("media-uuid-001", pool);
    expect(asset.id).toBe("media-uuid-001");
    expect(asset.dimensions).toEqual({ width: 800, height: 600 });
  });

  it("throws MEDIA_NOT_FOUND for unknown id", async () => {
    const pool = makePool(() => ({ rows: [] }));
    await expect(getOryCMSMedia("unknown", pool)).rejects.toMatchObject({
      code: "MEDIA_NOT_FOUND",
      statusCode: 404,
    });
  });
});

// ── updateOryCMSMedia ─────────────────────────────────────────────────────────

describe("updateOryCMSMedia", () => {
  it("updates name/altText/caption", async () => {
    let updateSql = "";
    let callIdx = 0;
    const pool = makePool((sql: string) => {
      callIdx++;
      if (callIdx === 1) return { rows: [] }; // ensureTables
      if (sql.startsWith("UPDATE")) {
        updateSql = sql;
        return { rows: [] };
      }
      if (callIdx === 3) return { rows: [] }; // ensureTables (getOryCMSMedia)
      return { rows: [mediaRow({ name: "renamed.jpg" })] };
    });

    const asset = await updateOryCMSMedia("media-uuid-001", { name: "renamed.jpg" }, pool);
    expect(updateSql).toContain("name = $1");
    expect(asset.name).toBe("renamed.jpg");
  });
});

// ── deleteOryCMSMedia ─────────────────────────────────────────────────────────

describe("deleteOryCMSMedia", () => {
  beforeEach(() => {
    mockDelete.mockReset();
    mockDelete.mockResolvedValue(undefined);
  });

  it("deletes via the storage adapter and removes the DB row", async () => {
    let deleted = false;
    let callIdx = 0;
    const pool = makePool((sql: string) => {
      callIdx++;
      if (callIdx === 1) return { rows: [] }; // ensureTables
      if (callIdx === 2)
        return {
          rows: [{ file_path: "/project/public/uploads/uuid-abc.jpg", storage_provider: "local" }],
        }; // SELECT
      if (sql.includes("DELETE")) {
        deleted = true;
        return { rows: [] };
      }
      return { rows: [] };
    });

    await deleteOryCMSMedia("media-uuid-001", pool);
    expect(mockDelete).toHaveBeenCalledWith("/project/public/uploads/uuid-abc.jpg");
    expect(deleted).toBe(true);
  });

  it("throws MEDIA_NOT_FOUND when asset does not exist", async () => {
    const pool = makePool(() => ({ rows: [] }));
    await expect(deleteOryCMSMedia("nope", pool)).rejects.toMatchObject({
      code: "MEDIA_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("succeeds even if the storage adapter fails to delete (best-effort)", async () => {
    mockDelete.mockRejectedValueOnce(new Error("ENOENT"));
    let callIdx = 0;
    const pool = makePool(() => {
      callIdx++;
      if (callIdx === 1) return { rows: [] };
      if (callIdx === 2) return { rows: [{ file_path: "/missing/file.jpg", storage_provider: "local" }] };
      return { rows: [] };
    });
    await expect(deleteOryCMSMedia("media-uuid-001", pool)).resolves.toBeUndefined();
  });
});

// ── OryCMSMediaError ──────────────────────────────────────────────────────────

describe("OryCMSMediaError", () => {
  it("carries code, statusCode, and name", () => {
    const e = new OryCMSMediaError("MEDIA_NOT_FOUND", "not found", 404);
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe("MEDIA_NOT_FOUND");
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe("OryCMSMediaError");
  });
});
