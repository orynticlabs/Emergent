"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FolderOpen, Plus, Save, Trash2, Upload, X } from "lucide-react";
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
import type { OryCMSCaseStudy } from "./OryCMSCaseStudiesAdminPage";
import type { OryCMSCaseStudyResult } from "@/case-studies";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface FormState {
  title: string;
  slug: string;
  category: string;
  industry: string;
  client: string;
  timeline: string;
  imageUrl: string | null;
  description: string;
  challenge: string;
  approach: string[];
  results: OryCMSCaseStudyResult[];
  tags: string;
  active: boolean;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  category: "",
  industry: "",
  client: "",
  timeline: "",
  imageUrl: null,
  description: "",
  challenge: "",
  approach: [],
  results: [],
  tags: "",
  active: true,
  sortOrder: "0",
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends -2, -3, … until the slug doesn't collide with an existing one -
 *  there's no slug input for the admin to fix a collision by hand. */
function uniqueSlug(base: string, taken: Set<string>): string {
  if (!base) return base;
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

interface CaseStudyDetail extends OryCMSCaseStudy {
  client: string | null;
  timeline: string | null;
  description: string | null;
  challenge: string | null;
  approach: string[];
  results: OryCMSCaseStudyResult[];
  tags: string[];
}

function Breadcrumb({ isEdit }: { isEdit: boolean }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
      <span>Overview</span>
      <span>/</span>
      <span>Case Studies</span>
      <span>/</span>
      <span className="text-foreground">{isEdit ? "Edit" : "New"}</span>
    </nav>
  );
}

/** Shared create/edit page - `caseStudyId` omitted means "create new". */
export function OryCMSCaseStudyFormPage({ caseStudyId }: { caseStudyId?: string }) {
  const router = useRouter();
  const isEdit = !!caseStudyId;
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canWrite = useOryCMSPermission("case-studies", isEdit ? "update" : "create");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [others, setOthers] = useState<OryCMSCaseStudy[]>([]);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!isEdit || !sessionLoaded || !canWrite) return;
    fetchJson<CaseStudyDetail>(`/api/orycms/case-studies/${caseStudyId}`)
      .then((c) =>
        setForm({
          title: c.title,
          slug: c.slug,
          category: c.category ?? "",
          industry: c.industry ?? "",
          client: c.client ?? "",
          timeline: c.timeline ?? "",
          imageUrl: c.imageUrl,
          description: c.description ?? "",
          challenge: c.challenge ?? "",
          approach: c.approach ?? [],
          results: c.results ?? [],
          tags: (c.tags ?? []).join(", "),
          active: c.active,
          sortOrder: String(c.sortOrder),
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load case study."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, caseStudyId, sessionLoaded, canWrite]);

  // Used to flag a sort-order collision, and to keep the auto-generated slug
  // (on create) from colliding with an existing one - there's no slug input
  // for the admin to fix that by hand, so it has to be avoided automatically.
  useEffect(() => {
    if (!sessionLoaded || !canWrite) return;
    fetchJson<OryCMSCaseStudy[]>("/api/orycms/case-studies")
      .then((all) => setOthers(all.filter((c) => c.id !== caseStudyId)))
      .catch(() => {});
  }, [sessionLoaded, canWrite, caseStudyId]);

  const sortOrderConflict = others.find((c) => c.sortOrder === Number(form.sortOrder));
  const canSubmit = form.title.trim().length > 0 && form.slug.trim().length > 0 && !submitting;

  // Slug is derived, not typed - on create it's recomputed from the title
  // (disambiguated against existing slugs); on edit the original slug is
  // kept fixed so the case study's URL never changes under someone editing
  // the title.
  const setTitle = (title: string) => {
    setForm((f) => {
      if (isEdit) return { ...f, title };
      const takenSlugs = new Set(others.map((o) => o.slug));
      return { ...f, title, slug: uniqueSlug(slugify(title), takenSlugs) };
    });
  };

  const updateApproachStep = (index: number, value: string) => {
    setForm((f) => ({ ...f, approach: f.approach.map((s, i) => (i === index ? value : s)) }));
  };
  const addApproachStep = () => setForm((f) => ({ ...f, approach: [...f.approach, ""] }));
  const removeApproachStep = (index: number) =>
    setForm((f) => ({ ...f, approach: f.approach.filter((_, i) => i !== index) }));

  const updateResult = (index: number, field: keyof OryCMSCaseStudyResult, value: string) => {
    setForm((f) => ({
      ...f,
      results: f.results.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  };
  const addResult = () => setForm((f) => ({ ...f, results: [...f.results, { value: "", label: "" }] }));
  const removeResult = (index: number) =>
    setForm((f) => ({ ...f, results: f.results.filter((_, i) => i !== index) }));

  // Device file → validate type/size → hand off to the crop dialog as an
  // object URL. Nothing is uploaded yet; only the *cropped* result is -
  // same flow as Companies' logo upload.
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type", { description: "Please choose a JPG or PNG image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large", { description: "Cover images must be 4 MB or smaller." });
      return;
    }
    setCropSource(URL.createObjectURL(file));
  };

  // Existing media asset picked → also routed through the crop dialog so
  // every cover image ends up the same treatment, whether freshly uploaded
  // or reused from the library.
  const handleMediaSelect = (url: string) => {
    setPickerOpen(false);
    setCropSource(url);
  };

  // Crop confirmed → upload the cropped PNG as a new media asset and use its
  // URL as the cover image.
  const handleCropConfirm = async (blob: Blob) => {
    setCropSource(null);
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "cover.png", { type: "image/png" }));
      const res = await fetch("/api/orycms/media", { method: "POST", body: formData });
      const body = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? "Upload failed.");
      setForm((f) => ({ ...f, imageUrl: body.data!.url }));
    } catch (err) {
      toast.error("Cover image upload failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const input = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim() || null,
      industry: form.industry.trim() || null,
      client: form.client.trim() || null,
      timeline: form.timeline.trim() || null,
      imageUrl: form.imageUrl,
      description: form.description.trim() || null,
      challenge: form.challenge.trim() || null,
      approach: form.approach.map((s) => s.trim()).filter(Boolean),
      results: form.results
        .map((r) => ({ value: r.value.trim(), label: r.label.trim() }))
        .filter((r) => r.value || r.label),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (isEdit) {
        await fetchJson(`/api/orycms/case-studies/${caseStudyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success("Case study updated");
      } else {
        const created = await fetchJson<OryCMSCaseStudy>("/api/orycms/case-studies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success(`Case study "${created.title}" added`);
      }
      router.push("/admin/case-studies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save case study.");
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
            {isEdit ? "Edit Case Study" : "Add Case Study"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Shown in the site's portfolio and on its own case-study read page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/case-studies")}
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
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Save Case Study"}
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
                <Label htmlFor="cs-title">Title*</Label>
                <Input
                  className="shadow-none"
                  id="cs-title"
                  value={form.title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Knowledge Assistant"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  URL: /portfolio/{form.slug || "…"} - generated automatically from the title.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cs-category">Category</Label>
                  <Input
                    className="shadow-none"
                    id="cs-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. AI Solutions"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-industry">Industry</Label>
                  <Input
                    className="shadow-none"
                    id="cs-industry"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="e.g. Fintech"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-client">Client</Label>
                  <Input
                    className="shadow-none"
                    id="cs-client"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    placeholder="e.g. Fintech lender"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-timeline">Timeline</Label>
                  <Input
                    className="shadow-none"
                    id="cs-timeline"
                    value={form.timeline}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    placeholder="e.g. 12 weeks"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cs-desc">Short description</Label>
                <Textarea
                  className="shadow-none"
                  id="cs-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="One-line summary shown on the portfolio grid card."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cs-tags">Tags</Label>
                <Input
                  className="shadow-none"
                  id="cs-tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Next.js, OryCMS, Stripe"
                />
                <p className="text-[11px] text-muted-foreground">Comma-separated.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-[15px] font-semibold">Case study content</h2>

              <div className="space-y-1.5">
                <Label htmlFor="cs-challenge">The challenge</Label>
                <Textarea
                  className="shadow-none"
                  id="cs-challenge"
                  rows={3}
                  value={form.challenge}
                  onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                  placeholder="What problem was the client actually facing?"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="!mb-0">Approach - numbered steps</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-[11.5px]" onClick={addApproachStep}>
                    <Plus className="h-3 w-3" />
                    Add step
                  </Button>
                </div>
                {form.approach.length === 0 && (
                  <p className="text-[11.5px] text-muted-foreground">No steps yet.</p>
                )}
                {form.approach.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-2.5 text-[11px] font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <Textarea
                      className="shadow-none"
                      rows={2}
                      value={step}
                      onChange={(e) => updateApproachStep(i, e.target.value)}
                      placeholder="What did we actually build for this step?"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-1 h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeApproachStep(i)}
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="!mb-0">Results</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-[11.5px]" onClick={addResult}>
                    <Plus className="h-3 w-3" />
                    Add result
                  </Button>
                </div>
                {form.results.length === 0 && (
                  <p className="text-[11.5px] text-muted-foreground">No results yet.</p>
                )}
                {form.results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="shadow-none"
                      value={r.value}
                      onChange={(e) => updateResult(i, "value", e.target.value)}
                      placeholder="Value, e.g. Minutes"
                    />
                    <Input
                      className="shadow-none"
                      value={r.label}
                      onChange={(e) => updateResult(i, "label", e.target.value)}
                      placeholder="Label, e.g. Loan decisions, down from days"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeResult(i)}
                      aria-label="Remove result"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-[15px] font-semibold">Visibility</h2>

              <div className="space-y-1.5">
                <Label htmlFor="cs-order">Sort order</Label>
                <Input
                  className={sortOrderConflict ? "border-destructive shadow-none" : "shadow-none"}
                  id="cs-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
                {sortOrderConflict && (
                  <p className="text-[11.5px] text-destructive">
                    Order {form.sortOrder} is already used by "{sortOrderConflict.title}". Pick a different number.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="cs-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="cs-active" className="!mb-0">
                  Active - visible on the site
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-[15px] font-semibold">Cover image</h2>
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
                  <img src={form.imageUrl} alt="Cover preview" className="h-16 w-28 rounded-md object-cover" />
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
                  <img src={form.imageUrl} alt={form.title || "Cover"} className="h-32 w-full rounded-md object-cover" />
                ) : (
                  <span className="text-sm text-white/40">No cover image yet</span>
                )}
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                Used as the portfolio grid card image and the case-study page's hero/blurred background.
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
