"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FolderOpen, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { OryCMSImageCropDialog } from "./OryCMSImageCropDialog";
import { OryCMSMediaPickerDialog } from "./OryCMSMediaPickerDialog";
import type { OryCMSCompany } from "./OryCMSCompaniesAdminPage";

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface FormState {
  name: string;
  logoUrl: string | null;
  active: boolean;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  logoUrl: null,
  active: true,
  sortOrder: "0",
};

function Breadcrumb({ isEdit }: { isEdit: boolean }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
      <span>Overview</span>
      <span>/</span>
      <span>Companies</span>
      <span>/</span>
      <span className="text-foreground">{isEdit ? "Edit" : "New"}</span>
    </nav>
  );
}

/** Shared create/edit page — `companyId` omitted means "create new". */
export function OryCMSCompanyFormPage({ companyId }: { companyId?: string }) {
  const router = useRouter();
  const isEdit = !!companyId;
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canWrite = useOryCMSPermission("companies", isEdit ? "update" : "create");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [others, setOthers] = useState<OryCMSCompany[]>([]);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!isEdit || !sessionLoaded || !canWrite) return;
    fetchJson<OryCMSCompany>(`/api/orycms/companies/${companyId}`)
      .then((c) =>
        setForm({
          name: c.name,
          logoUrl: c.logoUrl,
          active: c.active,
          sortOrder: String(c.sortOrder),
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load company."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, companyId, sessionLoaded, canWrite]);

  // Used to flag a sort-order collision before it hits the server.
  useEffect(() => {
    if (!sessionLoaded || !canWrite) return;
    fetchJson<OryCMSCompany[]>("/api/orycms/companies")
      .then((all) => setOthers(all.filter((c) => c.id !== companyId)))
      .catch(() => {});
  }, [sessionLoaded, canWrite, companyId]);

  const sortOrderConflict = others.find((c) => c.sortOrder === Number(form.sortOrder));
  const canSubmit = form.name.trim().length > 0 && !!form.logoUrl && !submitting && !sortOrderConflict;

  // Device file → validate type/size → hand off to the crop dialog as an
  // object URL. Nothing is uploaded yet; only the *cropped* result is.
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type", { description: "Please choose a JPG or PNG image." });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Image too large", { description: "Logo images must be 2 MB or smaller." });
      return;
    }
    setCropSource(URL.createObjectURL(file));
  };

  // Existing media asset picked → also routed through the crop dialog so
  // every logo — freshly uploaded or reused — ends up the same fixed shape.
  const handleMediaSelect = (url: string) => {
    setPickerOpen(false);
    setCropSource(url);
  };

  // Crop confirmed → upload the cropped PNG as a new media asset and use its
  // URL as the logo. The original source (device file or library asset) is
  // never itself saved as the logo.
  const handleCropConfirm = async (blob: Blob) => {
    setCropSource(null);
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "logo.png", { type: "image/png" }));
      const res = await fetch("/api/orycms/media", { method: "POST", body: formData });
      const body = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? "Upload failed.");
      setForm((f) => ({ ...f, logoUrl: body.data!.url }));
    } catch (err) {
      toast.error("Logo upload failed", { description: err instanceof Error ? err.message : undefined });
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
      logoUrl: form.logoUrl,
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (isEdit) {
        await fetchJson(`/api/orycms/companies/${companyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success("Company updated");
      } else {
        const created = await fetchJson<OryCMSCompany>("/api/orycms/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success(`Company "${created.name}" added`);
      }
      router.push("/admin/companies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company.");
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
            {isEdit ? "Edit Company" : "Add Company"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Shown as a logo in the "Trusted by forward-thinking teams" row on the homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/companies")}
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
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Save Company"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-border bg-transparent shadow-none">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-[15px] font-semibold">Company details</h2>

            <div className="space-y-1.5">
              <Label htmlFor="co-name">Name of company*</Label>
              <Input
                className="shadow-none"
                id="co-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. QUANTIVA"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>Logo*</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />

              {form.logoUrl && (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logoUrl} alt="Logo preview" className="h-10 w-24 object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 gap-1.5 text-[12px] text-destructive hover:text-destructive"
                    onClick={() => setForm((f) => ({ ...f, logoUrl: null }))}
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
              <p className="text-[11px] text-muted-foreground">JPG or PNG, up to 2 MB. You'll crop it before saving.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="co-order">Sort order</Label>
              <Input
                className={sortOrderConflict ? "border-destructive shadow-none" : "shadow-none"}
                id="co-order"
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
                id="co-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="co-active" className="!mb-0">
                Active — visible on the site
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-transparent shadow-none">
          <CardContent className="space-y-3 p-6">
            <h2 className="text-[15px] font-semibold">Preview</h2>
            <div className="flex items-center justify-center rounded-lg border border-border bg-[#05060e] px-6 py-8">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt={form.name || "Logo"} className="h-10 w-32 object-contain" />
              ) : (
                <span className="text-sm text-white/40">No logo uploaded yet</span>
              )}
            </div>
            <p className="text-[11.5px] text-muted-foreground">
              All logos render at the same fixed size in the homepage marquee, regardless of the
              original image's dimensions.
            </p>
          </CardContent>
        </Card>
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
