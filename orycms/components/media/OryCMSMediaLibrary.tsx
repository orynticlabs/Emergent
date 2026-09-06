"use client";

import { useEffect, useRef, useState } from "react";
import { File, FileText, Film, Image, ImageOff, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OryCMSSpinner } from "@/components/ui/orycms-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { OryCMSMediaAsset } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TypeIcon({ type, mime }: { type: string; mime: string }) {
  if (type === "image") return <Image className="h-4 w-4 text-blue-500" />;
  if (type === "video") return <Film className="h-4 w-4 text-purple-500" />;
  if (mime === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function OryCMSMediaLibrary() {
  const [assets, setAssets] = useState<OryCMSMediaAsset[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"name" | "size" | "created_at">("created_at");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OryCMSMediaAsset | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<OryCMSMediaAsset[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Debounce search ─────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, dir]);

  // ── Fetch assets ────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sort,
      dir,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/orycms/media?${params}`)
      .then((r) => r.json())
      .then(
        (json: {
          success: boolean;
          data?: OryCMSMediaAsset[];
          meta?: typeof meta;
          error?: { message: string };
        }) => {
          if (json.success) {
            setAssets(json.data ?? []);
            if (json.meta) setMeta(json.meta);
          } else {
            setError(json.error?.message ?? "Failed to load media.");
          }
        },
      )
      .catch(() => setError("Failed to load media."))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, sort, dir]);

  // ── Upload ──────────────────────────────────────────────────────────────────

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setUploading(true);

    // Snapshot into a plain array up front: `fileList` is a *live* view of the
    // input's selection, and the caller resets `input.value = ""` right after
    // this call returns (to allow re-selecting the same file later) — which
    // clears that live list. Reading `fileList[i]` later in this loop would
    // silently see an empty list for every file after the first.
    const files = Array.from(fileList);

    for (const file of files) {
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/orycms/media", { method: "POST", body: form });
        const json = (await res.json()) as {
          success: boolean;
          data?: OryCMSMediaAsset;
          error?: { message: string };
        };
        if (json.success && json.data) {
          // Show the new asset immediately — no refetch/refresh needed.
          setAssets((prev) => [json.data as OryCMSMediaAsset, ...prev]);
          setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
        } else {
          setError(json.error?.message ?? "Upload failed.");
        }
      } catch {
        setError("Upload failed.");
      }
    }

    setUploading(false);
  }

  // ── Selection ─────────────────────────────────────────────────────────────────

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // ── Delete (single or bulk share the same confirmation dialog) ──────────────

  async function confirmDelete() {
    if (!pendingDelete?.length) return;
    setDeleting(true);

    const results = await Promise.all(
      pendingDelete.map(async (asset) => {
        const res = await fetch(`/api/orycms/media/${asset.id}`, { method: "DELETE" });
        const json = (await res.json()) as { success: boolean; error?: { message: string } };
        return { asset, success: json.success, message: json.error?.message };
      }),
    );

    const deletedIds = new Set(results.filter((r) => r.success).map((r) => r.asset.id));
    const failed = results.filter((r) => !r.success);

    if (deletedIds.size > 0) {
      setAssets((prev) => prev.filter((a) => !deletedIds.has(a.id)));
      setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - deletedIds.size) }));
      if (selected && deletedIds.has(selected.id)) setSelected(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });
    }

    if (failed.length > 0) {
      setError(failed[0].message ?? "Some files could not be deleted.");
    } else {
      setPendingDelete(null);
    }
    setDeleting(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Asset management"
          title="Media library"
          description="Upload and reference images, videos, and documents."
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <OryCMSSpinner className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv"
            className="hidden"
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4 lg:p-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.size > 0 ? (
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <span className="text-[12.5px] font-medium">{selectedIds.size} selected</span>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setError(null);
                  setPendingDelete(assets.filter((a) => selectedIds.has(a.id)));
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete selected
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear selection
              </Button>
            </div>
          ) : (
            <>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="pl-8 text-[13px]"
                />
              </div>
              <select
                value={`${sort}:${dir}`}
                onChange={(e) => {
                  const [s, d] = e.target.value.split(":") as [typeof sort, typeof dir];
                  setSort(s);
                  setDir(d);
                }}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] text-foreground"
              >
                <option value="created_at:desc">Newest first</option>
                <option value="created_at:asc">Oldest first</option>
                <option value="name:asc">Name A–Z</option>
                <option value="name:desc">Name Z–A</option>
                <option value="size:desc">Largest first</option>
                <option value="size:asc">Smallest first</option>
              </select>
              <span className="text-[12px] text-muted-foreground">
                {meta.total} file{meta.total !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-1.5 p-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-muted-foreground">
              <ImageOff className="h-4.5 w-4.5" />
            </div>
            <div className="text-[13px] font-medium">No files yet</div>
            <div className="text-[12px] text-muted-foreground">
              Upload an image, video, or document to get started.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {assets.map((asset) => {
              const isChecked = selectedIds.has(asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelected(asset)}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border shadow-xs transition-all hover:shadow-elevated ${
                    isChecked
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-border-strong"
                  } bg-surface`}
                >
                  {/* Select checkbox */}
                  <div
                    className={`absolute left-1.5 top-1.5 z-10 ${
                      isChecked || selectedIds.size > 0 ? "flex" : "hidden group-hover:flex"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => toggleSelected(asset.id, checked === true)}
                      className="border-white bg-background/80 backdrop-blur-sm data-[state=checked]:border-foreground"
                      aria-label={`Select ${asset.name}`}
                    />
                  </div>
                  {/* Thumbnail */}
                  <div className="aspect-square overflow-hidden bg-surface-muted">
                    {asset.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.alternativeText ?? asset.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <TypeIcon type={asset.type} mime={asset.mimeType} />
                      </div>
                    )}
                  </div>
                  {/* Caption */}
                  <div className="p-2">
                    <div className="truncate text-[11.5px] font-medium">{asset.name}</div>
                    <div className="text-[11px] text-muted-foreground">{formatBytes(asset.size)}</div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setError(null);
                      setPendingDelete([asset]);
                    }}
                    className="absolute right-1.5 top-1.5 hidden rounded-md bg-background/80 p-1 text-destructive backdrop-blur-sm group-hover:flex hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {(meta.page > 1 || meta.hasMore) && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-[12px] text-muted-foreground">Page {meta.page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* ── Details popup ── */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-sm">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[15px]">{selected.name}</DialogTitle>
              </DialogHeader>
              {selected.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.url}
                  alt={selected.alternativeText ?? selected.name}
                  className="w-full rounded-lg object-cover"
                />
              )}
              <div className="space-y-1.5 text-[12px]">
                <div>
                  <span className="text-muted-foreground">Type:</span> {selected.mimeType}
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span> {formatBytes(selected.size)}
                </div>
                {selected.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>{" "}
                    {selected.dimensions.width} × {selected.dimensions.height}
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>{" "}
                  {new Date(selected.timestamps.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[12px]"
                  onClick={() => void navigator.clipboard.writeText(selected.url)}
                >
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[12px] text-destructive hover:text-destructive"
                  onClick={() => {
                    setError(null);
                    setPendingDelete([selected]);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation (single or bulk) ── */}
      <AlertDialog
        open={!!pendingDelete?.length}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete && pendingDelete.length > 1
                ? `Delete ${pendingDelete.length} files?`
                : "Delete file?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete &&
                (pendingDelete.length > 1 ? (
                  <>
                    This will permanently delete{" "}
                    <span className="font-medium">{pendingDelete.length} files</span>. This cannot be
                    undone.
                  </>
                ) : (
                  <>
                    This will permanently delete{" "}
                    <span className="font-medium">{pendingDelete[0]?.name}</span>. This cannot be
                    undone.
                  </>
                ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
