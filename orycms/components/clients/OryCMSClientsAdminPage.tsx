"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Globe, Mail, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";

// ── Shared types/helpers ─────────────────────────────────────────────────────

export interface OryCMSClient {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: "lead" | "onboarding" | "active" | "inactive" | "churned";
  notes: string | null;
  createdAt: string;
  projectCount: number;
}

export const CLIENT_INDUSTRIES = [
  "Fintech",
  "Healthcare & Biotech",
  "EdTech",
  "Supply Chain & Logistics",
  "Manufacturing",
  "Agriculture",
  "Retail & E-commerce",
  "Energy & Utilities",
  "Real Estate",
  "Automobile",
  "Hospitality & Food",
  "Other",
] as const;

export const CLIENT_STATUS_LABELS: Record<OryCMSClient["status"], string> = {
  lead: "Lead",
  onboarding: "Onboarding",
  active: "Active",
  inactive: "Inactive",
  churned: "Churned",
};

const CLIENT_STATUS_STYLES: Record<OryCMSClient["status"], string> = {
  lead: "border-border bg-surface-muted text-muted-foreground",
  onboarding: "border-info/30 bg-info/10 text-info",
  active: "border-success/30 bg-success/10 text-success",
  inactive: "border-warning/30 bg-warning/10 text-warning",
  churned: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function ClientStatusBadge({ status }: { status: OryCMSClient["status"] }) {
  return (
    <Badge variant="outline" className={cn("text-[10.5px]", CLIENT_STATUS_STYLES[status])}>
      {CLIENT_STATUS_LABELS[status]}
    </Badge>
  );
}

/** Mirrors the real table row's columns so rows don't jump/reflow once data arrives. */
function ClientRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-16" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

function NewClientDialog({ onCreated }: { onCreated: (client: OryCMSClient) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState<OryCMSClient["status"]>("lead");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !submitting;

  const reset = () => {
    setName("");
    setIndustry("");
    setWebsite("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setStatus("lead");
    setNotes("");
    setError(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const client = await fetchJson<OryCMSClient>("/api/orycms/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry || null,
          website: website.trim() || null,
          contactName: contactName.trim() || null,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          status,
          notes: notes.trim() || null,
        }),
      });
      toast.success(`Client "${client.name}" added`);
      reset();
      setOpen(false);
      onCreated(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-9 gap-1.5 text-[13px]">
        <Plus className="h-4 w-4" />
        Add client
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <Card className="w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold">Add client</div>
                  <p className="text-[11.5px] text-muted-foreground">
                    Capture their details now - you can start project onboarding right after.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="client-name">Client / company name</Label>
                  <Input
                    id="client-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Northco Manufacturing Pvt. Ltd."
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-industry">Industry</Label>
                  <select
                    id="client-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground"
                  >
                    <option value="">Select industry</option>
                    {CLIENT_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-status">Status</Label>
                  <select
                    id="client-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OryCMSClient["status"])}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground"
                  >
                    {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="client-website">Website</Label>
                  <Input
                    id="client-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-contact-name">Primary contact</Label>
                  <Input
                    id="client-contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-contact-email">Contact email</Label>
                  <Input
                    id="client-contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="client-contact-phone">Contact phone</Label>
                  <Input
                    id="client-contact-phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 …"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="client-notes">Notes</Label>
                  <Textarea
                    id="client-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Engagement scope, commercials, anything worth remembering…"
                    rows={2}
                  />
                </div>
              </div>
              {error && <p className="text-[12px] text-destructive">{error}</p>}
              <div className="flex items-center gap-2 pt-1">
                <Button onClick={submit} disabled={!canSubmit} size="sm" className="flex-1">
                  {submitting ? "Adding…" : "Add client"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export function OryCMSClientsAdminPage() {
  const router = useRouter();
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("clients", "read");
  const canCreate = useOryCMSPermission("clients", "create");
  const canUpdate = useOryCMSPermission("clients", "update");
  const canDelete = useOryCMSPermission("clients", "delete");

  const [clients, setClients] = useState<OryCMSClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OryCMSClient["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OryCMSClient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSClient[]>("/api/orycms/clients")
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load clients."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchJson(`/api/orycms/clients/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`"${deleteTarget.name}" removed`);
      setDeleteTarget(null);
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      toast.error("Failed to remove client", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  // `canRead` fails closed while the session is still loading - wait for it
  // so a fresh page load doesn't flash "no access" before permissions arrive.
  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <ClientRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Clients</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = clients.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q) ||
      (c.contactName ?? "").toLowerCase().includes(q) ||
      (c.contactEmail ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Engagements"
          title="Clients"
          description="Every client relationship - from first lead to active delivery - with their onboarded projects."
        />
        {canCreate && <NewClientDialog onCreated={() => load()} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="h-8 w-[240px] pl-8 text-[13px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-8 rounded-md border border-border bg-surface px-2.5 text-[12.5px] text-foreground"
          >
            <option value="all">All statuses</option>
            {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[12px] text-muted-foreground">
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[820px] text-[13px]">
          <thead className="border-b border-border bg-surface-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Client
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Industry
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Primary contact
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Projects
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => <ClientRowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px] text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "No clients match your filters."
                    : "No clients yet. Add your first one."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((client) => (
                <tr
                  key={client.id}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{client.name}</span>
                        <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          #{client.id.slice(0, 8)}
                        </span>
                      </div>
                      {client.website && (
                        <div className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                          <Globe className="h-3 w-3 shrink-0" />
                          {client.website.replace(/^https?:\/\//, "")}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ClientStatusBadge status={client.status} />
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                    {client.industry || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {client.contactName || client.contactEmail ? (
                      <div className="min-w-0">
                        <div className="truncate text-[12.5px]">{client.contactName || "-"}</div>
                        {client.contactEmail && (
                          <div className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            {client.contactEmail}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[12.5px] text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                    {client.projectCount} project{client.projectCount !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {canUpdate && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                          aria-label={`Edit ${client.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(client)}
                          aria-label={`Remove ${client.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium">{deleteTarget?.name}</span>. Projects already linked to
              this client will keep their history but lose the client association. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
              {deleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
