"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Plus, RotateCcw, ShieldCheck, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OryCMSSpinner } from "@/components/ui/orycms-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { cn, oryCMSAvatarUrl } from "@/lib/utils";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";

const ALLOWED_EMAIL_DOMAIN = "orynticlabs.com";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  status: "active" | "inactive" | "pending";
  roleId: string | null;
  roleName?: string | null;
}

interface OryCMSRoleOption {
  id: string;
  name: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  const body = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!res.ok || !body.success) throw new Error(body.error?.message ?? "Request failed.");
  return body.data as T;
}

function initials(nameOrEmail: string): string {
  const base = nameOrEmail.trim();
  if (!base) return "?";
  const parts = base.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: TeamMember["status"] }) {
  const styles: Record<TeamMember["status"], string> = {
    active: "border-success/30 bg-success/10 text-success",
    pending: "border-warning/30 bg-warning/10 text-warning",
    inactive: "border-border bg-surface-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("text-[10.5px] capitalize", styles[status])}>
      {status}
    </Badge>
  );
}

/** Mirrors MemberRow's layout so the loading state doesn't jump/reflow once real rows arrive. */
function MemberRowSkeleton() {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-0">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 basis-[200px] space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
      <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </li>
  );
}

function InviteMemberForm({
  roles,
  onInvited,
}: {
  roles: OryCMSRoleOption[];
  onInvited: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const domainValid = email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
  const canSubmit = name.trim().length > 0 && emailValid && domainValid && !submitting;

  const reset = () => {
    setName("");
    setEmail("");
    setRoleId("");
    setError(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await fetchJson<{ emailed: boolean; inviteLink: string | null }>(
        "/api/orycms/auth/invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            roleId: roleId || null,
          }),
        },
      );
      if (result.emailed) {
        toast.success("Invite sent", {
          description: `${email.trim()} will set their password from the link in their email.`,
        });
      } else {
        toast.message("Invite created", {
          description: `Email delivery isn't configured — share this link with them: ${result.inviteLink}`,
        });
      }
      reset();
      setOpen(false);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-9 gap-1.5 text-[13px]">
        <Plus className="h-4 w-4" />
        Add team member
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold">Add team member</div>
                  <p className="text-[11.5px] text-muted-foreground">
                    Only @{ALLOWED_EMAIL_DOMAIN} addresses can be invited.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="member-name">Full name</Label>
                <Input
                  id="member-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-email">Work email</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`name@${ALLOWED_EMAIL_DOMAIN}`}
                />
                {email.trim().length > 0 && emailValid && !domainValid && (
                  <p className="text-[12px] text-destructive">
                    Email must end with @{ALLOWED_EMAIL_DOMAIN}.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-role">Role</Label>
                <select
                  id="member-role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-foreground"
                >
                  <option value="">No role assigned</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rounded-md bg-surface-muted/60 px-3 py-2 text-[11.5px] text-muted-foreground">
                They'll receive an email with a link to set their own password — no password needed here.
              </p>
              {error && <p className="text-[12px] text-destructive">{error}</p>}
              <div className="flex items-center gap-2 pt-1">
                <Button onClick={submit} disabled={!canSubmit} size="sm" className="flex-1">
                  {submitting ? "Sending invite…" : "Send invite"}
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

function MemberRow({
  member,
  roles,
  isSelf,
  canManage,
  canAssignRole,
  onChanged,
}: {
  member: TeamMember;
  roles: OryCMSRoleOption[];
  isSelf: boolean;
  canManage: boolean;
  canAssignRole: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const changeRole = async (roleId: string) => {
    setBusy(true);
    try {
      await fetchJson(`/api/orycms/users/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: roleId || null }),
      });
      toast.success(`Role updated for ${member.name || member.email}`);
      onChanged();
    } catch (err) {
      toast.error("Failed to update role", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async () => {
    setBusy(true);
    try {
      await fetchJson(`/api/orycms/users/${member.id}`, { method: "DELETE" });
      toast.success(`${member.name || member.email} removed`);
      onChanged();
    } catch (err) {
      toast.error("Failed to remove member", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const resendInvite = async () => {
    setBusy(true);
    try {
      const result = await fetchJson<{ emailed: boolean; inviteLink: string | null }>(
        "/api/orycms/auth/invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: member.name ?? member.email,
            email: member.email,
          }),
        },
      );
      if (result.emailed) {
        toast.success("Invite re-sent", { description: member.email });
      } else {
        toast.message("Invite link ready", { description: result.inviteLink ?? undefined });
      }
      onChanged();
    } catch (err) {
      toast.error("Failed to resend invite", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const sendResetLink = async () => {
    setBusy(true);
    try {
      const result = await fetchJson<{ emailed: boolean; resetLink: string | null }>(
        `/api/orycms/users/${member.id}/send-reset-link`,
        { method: "POST" },
      );
      if (result.emailed) {
        toast.success("Reset link sent", { description: member.email });
      } else {
        toast.message("Reset link ready", { description: result.resetLink ?? undefined });
      }
    } catch (err) {
      toast.error("Failed to send reset link", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-0 transition-colors hover:bg-accent/30">
      <Avatar className="h-9 w-9 shrink-0 border border-border">
        <AvatarImage src={oryCMSAvatarUrl(member.id)} alt="" />
        <AvatarFallback className="bg-primary/10 text-[11.5px] font-semibold text-primary">
          {initials(member.name || member.email)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 basis-[200px]">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium">{member.name || "—"}</span>
          {isSelf && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              You
            </Badge>
          )}
        </div>
        <div className="truncate text-[11.5px] text-muted-foreground">{member.email}</div>
      </div>

      {canAssignRole ? (
        <select
          value={member.roleId ?? ""}
          onChange={(e) => void changeRole(e.target.value)}
          disabled={busy}
          aria-label={`Role for ${member.email}`}
          className="h-8 shrink-0 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground disabled:opacity-50"
        >
          <option value="">No role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      ) : (
        <Badge variant="outline" className="shrink-0 text-[10.5px]">
          {member.roleName ?? "No role"}
        </Badge>
      )}

      <StatusBadge status={member.status} />

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {member.status === "pending" && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={resendInvite}
            disabled={busy}
            title="Resend invite email"
            aria-label={`Resend invite to ${member.email}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        {canManage && member.status === "active" && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={sendResetLink}
            disabled={busy}
            title="Email a password reset link"
            aria-label={`Send reset link to ${member.email}`}
          >
            <KeyRound className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive disabled:opacity-30"
          onClick={removeMember}
          disabled={busy || isSelf}
          title={isSelf ? "You can't remove your own account" : "Remove team member"}
          aria-label={`Remove ${member.email}`}
        >
          {busy ? <OryCMSSpinner className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </li>
  );
}

export function OryCMSUsersAdminPage() {
  const { user: currentUser, loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("users", "read");
  const canCreate = useOryCMSPermission("users", "create");
  // Super Admin only: the default role permission matrix grants `users:manage`
  // to Super Admin alone, so this gates the direct "send reset link" action.
  const canManage = useOryCMSPermission("users", "manage");
  const canAssignRole = useOryCMSPermission("users", "update");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<OryCMSRoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchJson<TeamMember[]>("/api/orycms/users"),
      fetchJson<OryCMSRoleOption[]>("/api/orycms/roles").catch(() => []),
    ])
      .then(([us, rs]) => {
        setMembers(us);
        setRoles(rs);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load team members."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoaded && canRead) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, canRead]);

  // `canRead` fails closed (false) while the session is still loading (see
  // useOryCMSPermission) — without this check, every gated page flashes its
  // "no access" state for a beat on every fresh load before permissions
  // arrive and the real content pops in.
  if (!sessionLoaded) {
    return (
      <div className="mx-auto max-w-[1000px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <MemberRowSkeleton key={i} />
          ))}
        </ul>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Team Members</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Identity management"
          title="Team Members"
          description={`Manage admin users and their access. New members must use an @${ALLOWED_EMAIL_DOMAIN} email and set their own password via an emailed link.`}
        />
        {canCreate && <InviteMemberForm roles={roles} onInvited={load} />}
      </div>

      {loading ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <MemberRowSkeleton key={i} />
          ))}
        </ul>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">No team members yet</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Add your first team member to give them access.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              roles={roles}
              isSelf={m.id === currentUser?.id}
              canManage={canManage}
              canAssignRole={canAssignRole}
              onChanged={load}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
