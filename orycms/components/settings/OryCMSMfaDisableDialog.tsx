"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldOff, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";

/**
 * MFA removal confirmation dialog. Requires the current password AND a
 * current TOTP code - matches /api/orycms/auth/mfa/disable's requirement
 * that neither alone is sufficient. Disabling destroys every session for
 * the account server-side (including this one), so a successful disable
 * redirects to the login page rather than continuing as "authenticated" -
 * there is no session left to refresh into.
 */
export function OryCMSMfaDisableDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { refresh } = useOryCMSSession();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFields = () => {
    setPassword("");
    setCode("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    if (!next) resetFields();
    onOpenChange(next);
  };

  const handleDisable = async () => {
    if (submitting || !password || code.length !== 6) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orycms/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, code }),
      });
      const data = (await res.json()) as { success: boolean };

      if (res.ok && data.success) {
        resetFields();
        toast.success("MFA disabled. Please sign in again.");
        onOpenChange(false);
        router.push("/admin/login");
        return;
      }

      if (res.status === 401) {
        setError("Incorrect password. Please try again.");
        setPassword("");
      } else if (res.status === 422) {
        setError("Invalid verification code. Please try again.");
        setCode("");
      } else if (res.status === 409) {
        setError("MFA is no longer enabled on this account.");
        resetFields();
        onOpenChange(false);
        // No session was destroyed on this path (nothing to disable) -
        // just re-sync the session so the Settings page reflects reality.
        await refresh();
      } else {
        setError("Unable to disable MFA. Please try again.");
      }
      setSubmitting(false);
    } catch {
      setError("Unable to disable MFA. Please try again.");
      setSubmitting(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting && password && code.length === 6) handleDisable();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Disable multi-factor authentication</DialogTitle>
          <DialogDescription>
            This removes second-factor protection from your account. You&apos;ll need to sign in
            again with your password afterward.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-[12px] leading-relaxed text-destructive">
            Disabling MFA signs this account out everywhere. Confirm with your password and a
            current authenticator code to continue.
          </p>
        </div>

        <div className="space-y-4" onKeyDown={onKey}>
          <div className="space-y-1.5">
            <Label htmlFor="mfa-disable-password">Current password</Label>
            <PasswordInput
              id="mfa-disable-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mfa-disable-code">Authenticator code</Label>
            <Input
              id="mfa-disable-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-[16px] tracking-[0.3em]"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[12.5px] text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={submitting || !password || code.length !== 6}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            {submitting ? "Disabling…" : "Disable MFA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
