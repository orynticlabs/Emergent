"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import type { OryCMSAnnouncement } from "./OryCMSAnnouncementsAdminPage";

const COLOR_LABELS: Record<OryCMSAnnouncement["color"], string> = {
  orange: "Orange",
  blue: "Blue",
  neutral: "Neutral",
};

interface FormState {
  tag: string;
  color: OryCMSAnnouncement["color"];
  message: string;
  link: string;
  ctaLabel: string;
  active: boolean;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  tag: "",
  color: "orange",
  message: "",
  link: "",
  ctaLabel: "",
  active: true,
  sortOrder: "0",
};

const MESSAGE_MAX = 85;

function Breadcrumb({ isEdit }: { isEdit: boolean }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
      <span>Overview</span>
      <span>/</span>
      <span>Announcements</span>
      <span>/</span>
      <span className="text-foreground">{isEdit ? "Edit" : "New"}</span>
    </nav>
  );
}

/** Shared create/edit page — `announcementId` omitted means "create new". */
export function OryCMSAnnouncementFormPage({ announcementId }: { announcementId?: string }) {
  const router = useRouter();
  const isEdit = !!announcementId;
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canWrite = useOryCMSPermission("announcements", isEdit ? "update" : "create");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [others, setOthers] = useState<OryCMSAnnouncement[]>([]);

  useEffect(() => {
    if (!isEdit || !sessionLoaded || !canWrite) return;
    fetchJson<OryCMSAnnouncement>(`/api/orycms/announcements/${announcementId}`)
      .then((a) =>
        setForm({
          tag: a.tag,
          color: a.color,
          message: a.message,
          link: a.link ?? "",
          ctaLabel: a.ctaLabel ?? "",
          active: a.active,
          sortOrder: String(a.sortOrder),
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load announcement."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, announcementId, sessionLoaded, canWrite]);

  // Used to flag a sort-order collision before it hits the server — every
  // other announcement's order, excluding the one being edited.
  useEffect(() => {
    if (!sessionLoaded || !canWrite) return;
    fetchJson<OryCMSAnnouncement[]>("/api/orycms/announcements")
      .then((all) => setOthers(all.filter((a) => a.id !== announcementId)))
      .catch(() => {});
  }, [sessionLoaded, canWrite, announcementId]);

  const sortOrderConflict = others.find((a) => a.sortOrder === Number(form.sortOrder));
  const canSubmit =
    form.tag.trim().length > 0 && form.message.trim().length > 0 && !submitting && !sortOrderConflict;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const input = {
      tag: form.tag.trim(),
      color: form.color,
      message: form.message.trim(),
      link: form.link.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (isEdit) {
        await fetchJson(`/api/orycms/announcements/${announcementId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success("Announcement updated");
      } else {
        const created = await fetchJson<OryCMSAnnouncement>("/api/orycms/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        toast.success(`Announcement "${created.tag}" added`);
      }
      router.push("/admin/announcements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save announcement.");
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
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
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
            {isEdit ? "Edit Announcement" : "Add Announcement"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            The tag and message appear in the announcement bar at the top of the marketing site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/announcements")}
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
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Save Announcement"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column — announcement details */}
        <Card className="rounded-2xl border-border bg-transparent shadow-none">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-[15px] font-semibold">Announcement details</h2>

            <div className="space-y-1.5">
              <Label htmlFor="ann-tag">Tag*</Label>
              <Input
                className="shadow-none"
                id="ann-tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="e.g. NEW, OFFER, INSIGHT"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ann-message">Message*</Label>
                <span className="text-[11.5px] text-muted-foreground">
                  {form.message.length}/{MESSAGE_MAX}
                </span>
              </div>
              <Input
                className="shadow-none"
                id="ann-message"
                value={form.message}
                maxLength={MESSAGE_MAX}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="e.g. OryAI agent orchestration 2.0 is now live in production"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ann-link">Link</Label>
              <Input
                className="shadow-none"
                id="ann-link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/products"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ann-cta">Button label</Label>
              <Input
                className="shadow-none"
                id="ann-cta"
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                placeholder="e.g. Explore"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right column — publishing settings */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-[15px] font-semibold">Publishing</h2>

              <div className="space-y-1.5">
                <Label htmlFor="ann-status">Status</Label>
                <select
                  id="ann-status"
                  value={form.active ? "active" : "inactive"}
                  onChange={(e) => setForm({ ...form, active: e.target.value === "active" })}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ann-color">Tag color</Label>
                <select
                  id="ann-color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value as OryCMSAnnouncement["color"] })}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground"
                >
                  {Object.entries(COLOR_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ann-order">Sort order</Label>
                <Input
                  className={sortOrderConflict ? "border-destructive shadow-none" : "shadow-none"}
                  id="ann-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
                {sortOrderConflict && (
                  <p className="text-[11.5px] text-destructive">
                    Order {form.sortOrder} is already used by "{sortOrderConflict.tag}". Pick a different number.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-transparent shadow-none">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-[15px] font-semibold">Preview</h2>
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-[#0B0B0E] px-4 py-3">
                <span
                  className={
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.15em] text-white " +
                    (form.color === "orange" ? "bg-brand-orange" : form.color === "blue" ? "bg-brand-blue" : "bg-white/15")
                  }
                >
                  {form.tag || "TAG"}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-white/75">
                  {form.message || "Your announcement message will appear here"}
                </span>
                {form.ctaLabel && (
                  <span className="shrink-0 text-[10.5px] font-bold uppercase italic tracking-widest text-brand-orange">
                    {form.ctaLabel}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                This is how the announcement bar will look on the marketing site.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
