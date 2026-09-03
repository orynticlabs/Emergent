"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
}

export function OryCMSMediaPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch("/api/orycms/media?type=image&limit=60&sort=created_at&dir=desc")
      .then((res) => res.json())
      .then((body: { success: boolean; data?: MediaAsset[]; error?: { message: string } }) => {
        if (!body.success) throw new Error(body.error?.message ?? "Failed to load media.");
        setAssets(body.data ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load media."))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select from media</DialogTitle>
        </DialogHeader>

        {error && <p className="text-[12.5px] text-destructive">{error}</p>}

        <div className="grid max-h-[420px] grid-cols-4 gap-3 overflow-y-auto pt-2 sm:grid-cols-5">
          {loading &&
            Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
          {!loading && assets.length === 0 && !error && (
            <div className="col-span-full flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <ImageOff className="h-6 w-6" />
              <p className="text-[12.5px]">No images in your media library yet.</p>
            </div>
          )}
          {!loading &&
            assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect(asset.url)}
                className="group aspect-square overflow-hidden rounded-lg border border-border bg-surface-muted/40 transition-colors hover:border-primary"
                title={asset.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
                />
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
