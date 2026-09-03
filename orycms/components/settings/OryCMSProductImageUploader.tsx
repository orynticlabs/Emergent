"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OryCMSImageCropDialog } from "@/components/companies/OryCMSImageCropDialog";

/**
 * Upload/replace the image for one product box (see
 * app/(site)/_shared/components/site/InternalProjectsSection.jsx, which
 * reads these URLs from GET /api/orycms/settings/product-images/public).
 *
 * Reuses the exact same crop → upload flow already proven for company
 * logos: pick a file -> OryCMSImageCropDialog produces a cropped PNG Blob
 * client-side -> raw multipart POST to /api/orycms/media (not fetchJson —
 * file uploads use FormData, matching every other upload call site in this
 * codebase) -> the returned asset URL is handed to the parent via
 * `onUploaded`, which persists it into the `product_images` setting.
 */
export function OryCMSProductImageUploader({
  productId,
  productName,
  imageUrl,
  onUploaded,
}: {
  productId: string;
  productName: string;
  imageUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setCropSource(URL.createObjectURL(file));
  };

  const handleCropConfirm = async (blob: Blob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], `${productId}.png`, { type: "image/png" }));
      const res = await fetch("/api/orycms/media", { method: "POST", body: formData });
      const body = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) {
        throw new Error(body.error?.message ?? "Upload failed.");
      }
      onUploaded(body.data.url);
      toast.success(`${productName} image updated`);
    } catch (err) {
      toast.error("Upload failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
      setCropSource(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="text-[11.5px] font-medium text-muted-foreground">{productName}</div>
      <div className="h-32 w-full overflow-hidden rounded-lg border border-border bg-surface-muted/40">
        {imageUrl ? (
          <img src={imageUrl} alt={`${productName} product box image`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="mr-2 h-3.5 w-3.5" />
        {uploading ? "Uploading…" : imageUrl ? "Change image" : "Upload image"}
      </Button>

      <OryCMSImageCropDialog
        open={!!cropSource}
        imageSrc={cropSource}
        onCancel={() => setCropSource(null)}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
