"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJson, type OryCMSUserOption } from "./OryCMSProjectsAdminPage";

export type OryCMSProjectMemberRole = "manager" | "member" | "viewer";

export interface OryCMSProjectMember {
  id: string;
  projectId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  role: OryCMSProjectMemberRole;
  addedAt: string;
}

const ROLE_LABELS: Record<OryCMSProjectMemberRole, string> = {
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
};

function initials(name: string | null, email: string): string {
  const source = name || email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OryCMSProjectMembers({
  projectId,
  users,
  canUpdate,
}: {
  projectId: string;
  users: OryCMSUserOption[];
  canUpdate: boolean;
}) {
  const [members, setMembers] = useState<OryCMSProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<OryCMSProjectMemberRole>("member");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchJson<OryCMSProjectMember[]>(`/api/orycms/projects/${projectId}/members`)
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const availableUsers = users.filter((u) => !members.some((m) => m.userId === u.id));

  async function addMember() {
    if (!addUserId || adding) return;
    setAdding(true);
    try {
      const member = await fetchJson<OryCMSProjectMember>(`/api/orycms/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: addUserId, role: addRole }),
      });
      setMembers((prev) => [...prev, member]);
      setAddUserId("");
    } catch (err) {
      toast.error("Failed to add member", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setAdding(false);
    }
  }

  async function changeRole(userId: string, role: OryCMSProjectMemberRole) {
    try {
      const updated = await fetchJson<OryCMSProjectMember>(
        `/api/orycms/projects/${projectId}/members/${userId}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) },
      );
      setMembers((prev) => prev.map((m) => (m.userId === userId ? updated : m)));
    } catch (err) {
      toast.error("Failed to update role", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function removeMember(userId: string) {
    try {
      await fetchJson(`/api/orycms/projects/${projectId}/members/${userId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      toast.error("Failed to remove member", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          Team
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-4">
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {!loading && members.length === 0 && (
          <p className="py-2 text-[12.5px] text-muted-foreground">No team members yet.</p>
        )}
        {!loading &&
          members.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-1 py-2 hover:bg-accent/20">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[10.5px] font-semibold text-primary">
                {initials(m.userName, m.userEmail)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium">{m.userName || m.userEmail}</div>
                <div className="truncate text-[11px] text-muted-foreground">{m.userEmail}</div>
              </div>
              {canUpdate ? (
                <select
                  value={m.role}
                  onChange={(e) => void changeRole(m.userId, e.target.value as OryCMSProjectMemberRole)}
                  className="h-7 rounded-md border border-border bg-surface px-1.5 text-[11px] text-foreground"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] text-muted-foreground">{ROLE_LABELS[m.role]}</span>
              )}
              {canUpdate && (
                <button
                  onClick={() => void removeMember(m.userId)}
                  aria-label={`Remove ${m.userName || m.userEmail}`}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

        {canUpdate && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
            <select
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
              className="h-8 min-w-0 flex-1 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
            >
              <option value="">Add a team member…</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as OryCMSProjectMemberRole)}
              className="h-8 rounded-md border border-border bg-surface px-1.5 text-[11px] text-foreground"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => void addMember()}
              disabled={!addUserId || adding}
              aria-label="Add member"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
