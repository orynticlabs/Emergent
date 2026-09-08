"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Globe,
  Mail,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useOryCMSPermission } from "@/hooks";
import { fetchJson, StatusBadge, type OryCMSProject } from "@/components/projects/OryCMSProjectsAdminPage";
import {
  CLIENT_INDUSTRIES,
  CLIENT_STATUS_LABELS,
  ClientStatusBadge,
  type OryCMSClient,
} from "./OryCMSClientsAdminPage";

function formatClientSince(iso: string | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-[13px] font-medium">{value}</div>
      </div>
    </div>
  );
}

function NewProjectForClientRow({
  clientId,
  onAdd,
}: {
  clientId: string;
  onAdd: (project: OryCMSProject) => void;
}) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const project = await fetchJson<OryCMSProject>("/api/orycms/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), clientId }),
      });
      onAdd(project);
      setName("");
      toast.success(`Project "${project.name}" onboarded`);
    } catch (err) {
      toast.error("Failed to create project", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="flex items-center gap-2 px-4 py-3">
      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void submit()}
        placeholder="Onboard a project and press Enter…"
        className="h-8 flex-1 text-[13px]"
        disabled={submitting}
      />
    </li>
  );
}

export function OryCMSClientDetailPage({ clientId }: { clientId: string }) {
  const router = useRouter();
  const canUpdate = useOryCMSPermission("clients", "update");
  const canDelete = useOryCMSPermission("clients", "delete");
  const canCreateProject = useOryCMSPermission("projects", "create");

  const [client, setClient] = useState<OryCMSClient | null>(null);
  const [projects, setProjects] = useState<OryCMSProject[]>([]);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState<OryCMSClient["status"]>("lead");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJson<OryCMSClient>(`/api/orycms/clients/${clientId}`),
      fetchJson<OryCMSProject[]>(`/api/orycms/clients/${clientId}/projects`).catch(() => []),
    ])
      .then(([c, ps]) => {
        setClient(c);
        setName(c.name);
        setIndustry(c.industry ?? "");
        setWebsite(c.website ?? "");
        setContactName(c.contactName ?? "");
        setContactEmail(c.contactEmail ?? "");
        setContactPhone(c.contactPhone ?? "");
        setStatus(c.status);
        setNotes(c.notes ?? "");
        setProjects(ps);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load client."))
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await fetchJson<OryCMSClient>(`/api/orycms/clients/${clientId}`, {
        method: "PATCH",
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
      setClient(updated);
      toast.success("Client saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save client.";
      setError(message);
      toast.error("Failed to save client", { description: message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetchJson(`/api/orycms/clients/${clientId}`, { method: "DELETE" });
      toast.success("Client removed");
      router.push("/admin/clients");
    } catch (err) {
      toast.error("Failed to remove client", {
        description: err instanceof Error ? err.message : undefined,
      });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid gap-5 xl:grid-cols-3">
          <Skeleton className="h-96 w-full rounded-xl xl:col-span-2" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error ?? "Client not found."}
        </div>
      </div>
    );
  }

  const doneProjects = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">
      <button
        onClick={() => router.push("/admin/clients")}
        className="flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Clients
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold leading-tight tracking-tight">{name}</h1>
            <ClientStatusBadge status={client.status} />
            <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
              #{client.id.slice(0, 8)}
            </span>
          </div>
          <div className="mt-1 text-[12.5px] text-muted-foreground">
            {client.industry || "Industry not set"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Quick facts strip */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <Fact icon={Briefcase} label="Projects onboarded" value={`${projects.length} total · ${doneProjects} completed`} />
          <Fact icon={User} label="Primary contact" value={client.contactName || "Not set"} />
          <Fact icon={Building2} label="Status" value={CLIENT_STATUS_LABELS[client.status]} />
          <Fact icon={Calendar} label="Client since" value={formatClientSince(client.createdAt)} />
        </div>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Left: editable details */}
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="c-name">Client / company name</Label>
                  <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!canUpdate} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-industry">Industry</Label>
                  <select
                    id="c-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={!canUpdate}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
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
                  <Label htmlFor="c-status">Status</Label>
                  <select
                    id="c-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OryCMSClient["status"])}
                    disabled={!canUpdate}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground disabled:opacity-50"
                  >
                    {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="c-website">Website</Label>
                  <Input
                    id="c-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={!canUpdate}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <User className="h-4 w-4 text-muted-foreground" />
                Primary contact
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-contact-name">Full name</Label>
                  <Input
                    id="c-contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    disabled={!canUpdate}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-contact-email">Email</Label>
                  <Input
                    id="c-contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    disabled={!canUpdate}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="c-contact-phone">Phone</Label>
                  <Input
                    id="c-contact-phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    disabled={!canUpdate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="text-[14px] font-semibold">Notes</div>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                id="c-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                disabled={!canUpdate}
                placeholder="Engagement scope, commercials, anything worth remembering…"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: contact card + projects */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="text-[14px] font-semibold">Reach out</div>
            </CardHeader>
            <CardContent className="space-y-1 pt-4">
              {client.contactEmail ? (
                <a
                  href={`mailto:${client.contactEmail}`}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] transition-colors hover:bg-accent/40"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{client.contactEmail}</span>
                </a>
              ) : null}
              {client.contactPhone ? (
                <a
                  href={`tel:${client.contactPhone}`}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] transition-colors hover:bg-accent/40"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{client.contactPhone}</span>
                </a>
              ) : null}
              {client.website ? (
                <a
                  href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] transition-colors hover:bg-accent/40"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                </a>
              ) : null}
              {!client.contactEmail && !client.contactPhone && !client.website && (
                <p className="px-2 py-1 text-[12px] text-muted-foreground">
                  No contact details on file yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Onboarded projects
              </div>
            </CardHeader>
            <ul className="divide-y divide-border">
              {projects.length === 0 && (
                <li className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
                  No projects onboarded yet.
                </li>
              )}
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col gap-1.5 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/20"
                  onClick={() => router.push(`/admin/projectx/${project.id}`)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[13px] font-medium">{project.name}</span>
                    <StatusBadge status={project.status} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {project.doneTaskCount}/{project.taskCount} tasks done
                  </span>
                </li>
              ))}
              {canCreateProject && (
                <NewProjectForClientRow
                  clientId={clientId}
                  onAdd={(project) => setProjects((prev) => [project, ...prev])}
                />
              )}
            </ul>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{name}</span>. Its
              onboarded projects keep their history but lose the client association. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
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
