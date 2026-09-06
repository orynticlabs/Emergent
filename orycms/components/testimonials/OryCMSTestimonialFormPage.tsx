"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FolderOpen, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { OryCMSImageCropDialog } from "@/components/companies/OryCMSImageCropDialog";
import { OryCMSMediaPickerDialog } from "@/components/companies/OryCMSMediaPickerDialog";
import type { OryCMSTestimonial } from "./OryCMSTestimonialsAdminPage";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface FormState {
  name: string;
  role: string;
  quote: string;
  imageUrl: string | null;
  active: boolean;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  role: "",
  quote: "",
  imageUrl: null,
  active: true,
  sortOrder: "0",
};

interface TestimonialDetail extends OryCMSTestimonial {
  role: string | null;
}

function Breadcrumb({ isEdit }: { isEdit: boolean }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
      <span>Overview</span>
      <span>/</span>
      <span>Testimonials</span>
      <span>/</span>
      <span className="text-foreground">{isEdit ? "Edit" : "New"}</span>
    </nav>
  );
}

/** Shared create/edit page — `testimonialId` omitted means "create new". */
export function OryCMSTestimonialFormPage({ testimonialId }: { testimonialId?: string }) {
  const router = useRouter();
  const isEdit = !!testimonialId;
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canWrite = useOryCMSPermission("testimonials", isEdit ? "update" : "create");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [others, setOthers] = useState<OryCMSTestimonial[]>([]);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!isEdit || !sessionLoaded || !canWrite) return;
    fetchJson<TestimonialDetail>(`/api/orycms/testimonials/${testimonialId}`)
      .then((t) =>
        setForm({
          name: t.name,
          role: t.role ?? "",
          quote: t.quote,
          imageUrl: t.imageUrl,
          active: t.active,
          sortOrder: String(t.sortOrder),
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load testimonial."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, testimonialId, sessionLoaded, canWrite]);

  // Used to flag a sort-order collision, same pattern as case studies.
  useEffect(() => {
    if (!sessionLoaded || !canWrite) return;
    fetchJson<OryCMSTestimonial[]>("/api/orycms/testimonials")
      .then((all) => setOthers(all.filter((t) => t.id !== testimonialId)))
      .catch(() => {});
  }, [sessionLoaded, canWrite, testimonialId]);

  const sortOrderConflict = others.find((t) => t.sortOrder === Number(form.sortOrder));
  const canSubmit = form.name.trim().length > 0 && form.quote.trim().length > 0 && !submitting;

  // Device file → validate type/size → hand off to the crop dialog as an
  // object URL. Nothing is uploaded yet; only the *cropped* result is —
  // same flow as Case Studies' cover image upload.
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type", { description: "Please choose a JPG or PNG image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large", { description: "Photos must be 4 MB or smaller." });
      return;
    }
    setCropSource(URL.createObjectURL(file));
  };

  // Existing media asset picked → also routed through the crop dialog so
  // every photo ends up the same treatment, whether freshly uploaded or
  // reused from the library.
  const handleMediaSelect = (url: string) => {
    setPickerOpen(false);
    setCropSource(url);
  };

  // Crop confirmed → upload the cropped PNG as a new media asset and use its
  // URL as the photo.
  const handleCropConfirm = async (blob: Blob) => {
    setCropSource(null);
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "testimonial.png", { type: "image/png" }));
      const res = await fetch("/api/orycms/media", { method: "POST", body: formData });
      const body = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? "Upload failed.");
      setForm((f) => ({ ...f, imageUrl: body.data!.url }));
    } catch (err) {
      toast.error("Photo upload failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const input = {
      name: form.name.trim(),
      role: form.role.trim() || null,
      quote: form.quote.trim(),
      imageUrl: form.imageUrl,
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (isEdit) {
        await fetchJson(`/api/orycms/testimonials/${testimonialId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success("Testimonial updated");
      } else {
        const created = await fetchJson<OryCMSTestimonial>("/api/orycms/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success(`Testimonial "${created.name}" added`);
      }
      router.push("/admin/testimonials");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionLoaded || loading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <Skeleton className="h-3.5 w-56" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-3.5 w-96 max-w-full" />
        <Skeleton className="h-80 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  if (!canWrite) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="text-[15px] font-semibold">You don't have access to this page</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
      <Breadcrumb isEdit={isEdit} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">
            {isEdit ? "Edit Testimonial" : "Add Testimonial"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Shown in the about page's "How the studio actually works" carousel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/testimonials")}
            className="h-9 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="h-9 gap-1.5 rounded-lg bg-foreground px-3.5 text-[13px] font-medium text-background hover:opacity-90"
          >
            <Save className="h-3.5 w-3.5" />
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Save Testimonial"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-[15px] font-semibold">Overview</h2>

              <div className="space-y-1.5">
                <Label htmlFor="t-name">Name*</Label>
                <Input
                  className="shadow-none"
                  id="t-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Engineering"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-role">Role</Label>
                <Input
                  className="shadow-none"
                  id="t-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. How we scope work"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-quote">Quote*</Label>
                <Textarea
                  className="shadow-none"
                  id="t-quote"
                  rows={4}
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="What does this voice actually say about how the studio works?"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-[15px] font-semibold">Visibility</h2>

              <div className="space-y-1.5">
                <Label htmlFor="t-order">Sort order</Label>
                <Input
                  className={sortOrderConflict ? "border-destructive shadow-none" : "shadow-none"}
                  id="t-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
                {sortOrderConflict && (
                  <p className="text-[11.5px] text-destructive">
                    Order {form.sortOrder} is already used by "{sortOrderConflict.name}". Pick a different number.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="t-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="t-active" className="!mb-0">
                  Active — visible on the site
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-[15px] font-semibold">Photo</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />

              {form.imageUrl && (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Photo preview" className="h-16 w-16 rounded-full object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 gap-1.5 text-[12px] text-destructive hover:text-destructive"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
                  >
                    <X className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 text-[12.5px]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload from device"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 text-[12.5px]"
                  onClick={() => setPickerOpen(true)}
                  disabled={uploading}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Select from media
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">JPG or PNG, up to 4 MB. You'll crop it before saving.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-[15px] font-semibold">Preview</h2>
              <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-[#05060e] px-6 py-8">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt={form.name || "Photo"} className="h-32 w-32 rounded-full object-cover" />
                ) : (
                  <span className="text-sm text-white/40">No photo yet</span>
                )}
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                Used as the stacked speaker card in the about page's testimonials carousel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <OryCMSImageCropDialog
        open={!!cropSource}
        imageSrc={cropSource}
        onCancel={() => setCropSource(null)}
        onConfirm={handleCropConfirm}
      />
      <OryCMSMediaPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );
}
