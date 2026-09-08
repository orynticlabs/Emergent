"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Save, Search, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

// ── Shared types/helpers ─────────────────────────────────────────────────────

interface OryCMSRole {
  id: string;
  name: string;
  description: string | null;
}

interface OryCMSPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

const ACTION_ORDER = ["manage", "create", "read", "update", "delete", "publish"];
const ACTION_LABELS: Record<string, string> = {
  manage: "Manage (all)",
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
  publish: "Publish",
};

function resourceLabel(resource: string): string {
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  const body = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!res.ok || !body.success) throw new Error(body.error?.message ?? "Request failed.");
  return body.data as T;
}

function groupByResource(permissions: OryCMSPermission[]): [string, OryCMSPermission[]][] {
  const map = new Map<string, OryCMSPermission[]>();
  for (const perm of permissions) {
    const list = map.get(perm.resource) ?? [];
    list.push(perm);
    map.set(perm.resource, list);
  }
  return [...map.entries()]
    .map(([resource, perms]) => [
      resource,
      perms.sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action)),
    ] as [string, OryCMSPermission[]])
    .sort((a, b) => a[0].localeCompare(b[0]));
}

// ── List page ─────────────────────────────────────────────────────────────────

/** Mirrors the real table row's column widths so rows don't jump/reflow once data arrives. */
function RoleRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-40 max-w-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-24 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

export function OryCMSRolesListPage() {
  const router = useRouter();
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("roles", "read");
  const canCreate = useOryCMSPermission("roles", "create");
  const canUpdate = useOryCMSPermission("roles", "update");
  const canDelete = useOryCMSPermission("roles", "delete");
  const [roles, setRoles] = useState<OryCMSRole[]>([]);
  const [permissionCounts, setPermissionCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OryCMSRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJson<OryCMSRole[]>("/api/orycms/roles")
      .then(async (list) => {
        setRoles(list);
        const entries = await Promise.all(
          list.map(async (role) => {
            const perms = await fetchJson<OryCMSPermission[]>(
              `/api/orycms/roles/${role.id}/permissions`,
            ).catch(() => []);
            return [role.id, perms.length] as const;
          }),
        );
        setPermissionCounts(Object.fromEntries(entries));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load roles."))
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
      await fetchJson(`/api/orycms/roles/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error("Failed to delete role", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  // `canRead` fails closed while the session is still loading (see
  // useOryCMSPermission) - check `sessionLoaded` first so a fresh page load
  // doesn't flash the "no access" state before permissions actually arrive.
  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-3.5 w-96 max-w-full" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-60 rounded-md" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <RoleRowSkeleton key={i} />
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
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Roles & Access</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = search.trim()
    ? roles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          (r.description ?? "").toLowerCase().includes(search.trim().toLowerCase()),
      )
    : roles;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Access control"
          title="Roles & Access"
          description="Define roles and the exact permissions each one grants across the admin."
        />
        {canCreate && (
          <Button onClick={() => router.push("/admin/roles/new")} className="h-9 gap-1.5 text-[13px]">
            <Plus className="h-4 w-4" />
            New role
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles…"
            className="h-8 w-[240px] pl-8 text-[13px]"
          />
        </div>
        <span className="text-[12px] text-muted-foreground">
          {roles.length} role{roles.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead className="border-b border-border bg-surface-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                Permissions
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <RoleRowSkeleton key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[13px] text-muted-foreground">
                  {search ? `No roles matching "${search}"` : "No roles yet. Create your first one."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((role) => (
                <tr
                  key={role.id}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/30"
                  onClick={() => router.push(`/admin/roles/${role.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                    <span className="line-clamp-1">{role.description || "-"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10.5px]">
                      {permissionCounts[role.id] ?? 0} permission
                      {(permissionCounts[role.id] ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => router.push(`/admin/roles/${role.id}`)}
                        aria-label={`${canUpdate ? "Edit" : "View"} ${role.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(role)}
                          aria-label={`Delete ${role.name}`}
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
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium">{deleteTarget?.name}</span>.
              Any team member currently assigned this role will immediately lose all permissions it
              granted. This cannot be undone.
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
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Create / edit + permission matrix page ───────────────────────────────────

export function OryCMSRoleFormPage({ roleId }: { roleId?: string }) {
  const router = useRouter();
  const isNew = !roleId;
  const canUpdate = useOryCMSPermission("roles", "update");
  const canDelete = useOryCMSPermission("roles", "delete");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [catalog, setCatalog] = useState<OryCMSPermission[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    Promise.all([
      fetchJson<OryCMSRole>(`/api/orycms/roles/${roleId}`),
      fetchJson<OryCMSPermission[]>("/api/orycms/permissions"),
      fetchJson<OryCMSPermission[]>(`/api/orycms/roles/${roleId}/permissions`),
    ])
      .then(([role, allPerms, assigned]) => {
        setName(role.name);
        setDescription(role.description ?? "");
        setCatalog(allPerms);
        setSelected(new Set(assigned.map((p) => p.id)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load role."))
      .finally(() => setLoading(false));
  }, [isNew, roleId]);

  // For a brand-new role there's nothing to assign permissions to yet - still
  // load the catalog so the matrix can render (all unchecked) once created.
  useEffect(() => {
    if (!isNew) return;
    fetchJson<OryCMSPermission[]>("/api/orycms/permissions")
      .then(setCatalog)
      .catch(() => {});
  }, [isNew]);

  function togglePermission(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleResourceRow(perms: OryCMSPermission[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const perm of perms) {
        if (checked) next.add(perm.id);
        else next.delete(perm.id);
      }
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const role = await fetchJson<OryCMSRole>("/api/orycms/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (selected.size > 0) {
        await fetchJson(`/api/orycms/roles/${role.id}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionIds: [...selected] }),
        });
      }
      toast.success(`Role "${role.name}" created`);
      router.push(`/admin/roles/${role.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!roleId || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await fetchJson(`/api/orycms/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      await fetchJson(`/api/orycms/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: [...selected] }),
      });
      toast.success("Role saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save role.";
      setError(message);
      toast.error("Failed to save role", { description: message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!roleId) return;
    setDeleting(true);
    try {
      await fetchJson(`/api/orycms/roles/${roleId}`, { method: "DELETE" });
      toast.success("Role deleted");
      router.push("/admin/roles");
    } catch (err) {
      toast.error("Failed to delete role", {
        description: err instanceof Error ? err.message : undefined,
      });
      setDeleting(false);
    }
  }

  const grouped = groupByResource(catalog);
  const canSubmit = name.trim().length > 0 && !saving;
  const canEditFields = isNew || canUpdate;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/admin/roles")}
            className="mb-2 flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to roles
          </button>
          <PageHeader
            eyebrow={isNew ? "Access control" : "Role configuration"}
            title={isNew ? "Create role" : name || "Role"}
            description={
              isNew
                ? "Define a new role with a custom name and permission matrix."
                : "Configure permissions for this role across the admin."
            }
          />
        </div>
        {!isNew && canDelete && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete role
          </Button>
        )}
      </div>

      {loading ? (
        <>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-28" />
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-4 shrink-0 rounded-sm" />
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="text-[14px] font-semibold">Role details</div>
              <p className="text-[11.5px] text-muted-foreground">
                The name and description shown wherever this role is assigned.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="role-name">Role name</Label>
                  <Input
                    id="role-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Support Lead"
                    disabled={!canEditFields}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this role for?"
                    rows={2}
                    disabled={!canEditFields}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold">Permissions</div>
                  <p className="text-[11.5px] text-muted-foreground">
                    Check "Manage" to grant every action on a resource, or pick individual actions.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/50">
                      <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">
                        Resource
                      </th>
                      {ACTION_ORDER.map((action) => (
                        <th
                          key={action}
                          className="px-3 py-2.5 text-center text-[11px] font-medium text-muted-foreground"
                        >
                          {ACTION_LABELS[action]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.map(([resource, perms]) => {
                      const byAction = new Map(perms.map((p) => [p.action, p]));
                      const allChecked = perms.every((p) => selected.has(p.id));
                      return (
                        <tr
                          key={resource}
                          className="border-b border-border last:border-0 transition-colors hover:bg-accent/20"
                        >
                          <td className="px-4 py-2.5">
                            <label className="flex cursor-pointer items-center gap-2 font-medium">
                              <Checkbox
                                checked={allChecked}
                                onCheckedChange={(checked) =>
                                  toggleResourceRow(perms, checked === true)
                                }
                                disabled={!canEditFields}
                                aria-label={`All ${resourceLabel(resource)} permissions`}
                              />
                              {resourceLabel(resource)}
                            </label>
                          </td>
                          {ACTION_ORDER.map((action) => {
                            const perm = byAction.get(action);
                            return (
                              <td key={action} className="px-3 py-2.5 text-center">
                                {perm ? (
                                  <Checkbox
                                    checked={selected.has(perm.id)}
                                    onCheckedChange={(checked) =>
                                      togglePermission(perm.id, checked === true)
                                    }
                                    disabled={!canEditFields}
                                    aria-label={`${resourceLabel(resource)} - ${ACTION_LABELS[action]}`}
                                  />
                                ) : (
                                  <span className="text-border-strong">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
              {error}
            </div>
          )}

          {canEditFields && (
            <div className="flex justify-end">
              <Button onClick={isNew ? handleCreate : handleSave} disabled={!canSubmit}>
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving…" : isNew ? "Create role" : "Save changes"}
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium">{name}</span>. Any team
              member currently assigned this role will immediately lose all permissions it granted.
              This cannot be undone.
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
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
