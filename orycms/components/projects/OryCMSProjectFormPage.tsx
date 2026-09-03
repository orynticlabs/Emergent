"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Calendar, Save, User as UserIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  fetchJson,
  ClientCombobox,
  StatusBadge,
  STATUS_LABELS,
  type OryCMSProject,
  type OryCMSUserOption,
  type OryCMSClientOption,
} from "./OryCMSProjectsAdminPage";

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
      <span>Engagements</span>
      <span>/</span>
      <span>Projects</span>
      <span>/</span>
      <span className="text-foreground">New</span>
    </nav>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold">{title}</div>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Only the statuses that make sense for a brand-new project — completed/
// cancelled aren't reachable from the create form on purpose.
const STARTABLE_STATUSES: OryCMSProject["status"][] = ["planning", "active", "on_hold"];

/**
 * Full page — not a modal. A project create is a multi-field, occasionally
 * slow (loads users + clients) form; a dedicated route gives it a real URL,
 * a back button, and room to grow without fighting a fixed dialog height,
 * matching how Companies/Roles/Users-invite already do "create" as a page
 * rather than a popup.
 */
export function OryCMSProjectFormPage() {
  const router = useRouter();
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canCreate = useOryCMSPermission("projects", "create");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<OryCMSProject["status"]>("planning");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientId, setClientId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [users, setUsers] = useState<OryCMSUserOption[]>([]);
  const [clients, setClients] = useState<OryCMSClientOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoaded || !canCreate) return;
    Promise.all([
      fetchJson<OryCMSUserOption[]>("/api/orycms/users").catch(() => []),
      fetchJson<OryCMSClientOption[]>("/api/orycms/clients").catch(() => []),
    ])
      .then(([us, cs]) => {
        setUsers(us);
        setClients(cs);
      })
      .finally(() => setLoadingOptions(false));
  }, [sessionLoaded, canCreate]);

  const canSubmit = name.trim().length > 0 && !submitting;
  const selectedOwner = users.find((u) => u.id === ownerId);
  const selectedClient = clients.find((c) => c.id === clientId);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const project = await fetchJson<OryCMSProject>("/api/orycms/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          startDate: startDate || null,
          dueDate: dueDate || null,
          ownerId: ownerId || null,
          clientId: clientId || null,
        }),
      });
      toast.success(`Project "${project.name}" created`);
      router.push(`/admin/projectx/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
      setSubmitting(false);
    }
  };

  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-6 p-6 lg:p-8">
        <Skeleton className="h-3.5 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You can't create projects</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 p-6 lg:p-8">
      <Breadcrumb />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">New project</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            You can add tasks and team members once it's created.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/projectx")}
            className="h-9 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium"
            disabled={submitting}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="h-9 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium"
          >
            <Save className="h-3.5 w-3.5" />
            {submitting ? "Creating…" : "Create project"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Left: identity ─────────────────────────────────────────── */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <SectionHeader
              icon={Briefcase}
              title="Project details"
              description="The name, description, and status shown across the delivery board."
            />

            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 Website Revamp"
                autoFocus
                className="h-10 text-[14px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={5}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Starting status</Label>
              <div className="flex flex-wrap gap-2">
                {STARTABLE_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                      status === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Right: preview + timeline + assignment ─────────────────── */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Preview
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <span className="truncate text-[14px] font-semibold">
                  {name.trim() || "Untitled project"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-[11.5px] text-muted-foreground">
                  {selectedClient ? selectedClient.name : "Internal"}
                </span>
                {selectedOwner && (
                  <>
                    <span className="text-border">·</span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {selectedOwner.name || selectedOwner.email}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <SectionHeader icon={Calendar} title="Timeline" description="Optional — set these later if unsure." />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="project-start">Start date</Label>
                  <Input
                    id="project-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-[12.5px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="project-due">Due date</Label>
                  <Input
                    id="project-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={startDate || undefined}
                    className="h-9 text-[12.5px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <SectionHeader icon={Users} title="Assignment" description="Who this project belongs to." />
              <div className="space-y-1.5">
                <Label htmlFor="project-client">Client</Label>
                <ClientCombobox
                  id="project-client"
                  clients={clients}
                  value={clientId}
                  onChange={setClientId}
                  disabled={loadingOptions}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-owner">Owner</Label>
                <Select value={ownerId || "__unassigned__"} onValueChange={(v) => setOwnerId(v === "__unassigned__" ? "" : v)}>
                  <SelectTrigger id="project-owner" disabled={loadingOptions} className="h-9 text-[12.5px]">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Unassigned" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
