"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Selectable crop shapes - "Wide logo" matches the marquee's display box,
 * the rest let the admin pick a different shape when a logo needs it. */
function buildAspectPresets(naturalAspect: number | null) {
  return [
    { label: "Wide logo", value: 32 / 10 },
    { label: "Square", value: 1 },
    { label: "Landscape", value: 16 / 9 },
    { label: "Original", value: naturalAspect ?? 32 / 10 },
  ];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedBlob(imageSrc: string, cropPixels: CropPixels): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Crop failed."))), "image/png");
  });
}

export function OryCMSImageCropDialog({
  open,
  imageSrc,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const [aspect, setAspect] = useState(32 / 10);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropPixels | null>(null);
  const [processing, setProcessing] = useState(false);

  // Reset per-image and read its natural aspect for the "Original" preset.
  useEffect(() => {
    if (!imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspect(32 / 10);
    loadImage(imageSrc)
      .then((img) => setNaturalAspect(img.naturalWidth / img.naturalHeight))
      .catch(() => setNaturalAspect(null));
  }, [imageSrc]);

  const onCropComplete = useCallback((_area: unknown, pixels: CropPixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch {
      // surfaced by the caller's own upload error handling
    } finally {
      setProcessing(false);
    }
  };

  const presets = buildAspectPresets(naturalAspect);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop logo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setAspect(p.value)}
              className={cn(
                "h-7 rounded-full border px-3 text-[11.5px] transition-colors",
                Math.abs(aspect - p.value) < 0.001
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="mt-3 w-full"
          aria-label="Zoom"
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={processing}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={processing || !croppedAreaPixels}>
            {processing ? "Cropping…" : "Use this crop"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
