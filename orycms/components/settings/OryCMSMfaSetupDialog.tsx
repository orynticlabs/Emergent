"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import { useOryCMSSession } from "@/hooks";

interface OryCMSMfaSetup {
  setupToken: string;
  manualKey: string;
  qrCodeDataUrl: string;
}

/**
 * MFA enrollment dialog: fetches a fresh TOTP secret + QR code on open, then
 * lets the user confirm their authenticator app is enrolled by submitting the
 * first 6-digit code. A successful verify activates MFA server-side (see
 * /api/orycms/auth/mfa/verify), so this re-fetches the session afterward -
 * the Settings page's "Enabled"/"Disabled" status comes from that session
 * data, not from any local state here.
 */
export function OryCMSMfaSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { refresh } = useOryCMSSession();
  const [setup, setSetup] = useState<OryCMSMfaSetup | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSetup(null);
    setCode("");
    setVerified(false);
    setLoading(true);
    fetchJson<OryCMSMfaSetup>("/api/orycms/auth/mfa/setup", { method: "POST" })
      .then(setSetup)
      .catch((err) => {
        toast.error("Couldn't start MFA setup", {
          description: err instanceof Error ? err.message : undefined,
        });
        onOpenChange(false);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleVerify = async () => {
    if (!setup || code.length !== 6) return;
    setVerifying(true);
    try {
      await fetchJson("/api/orycms/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: setup.setupToken, code }),
      });
      setVerified(true);
      toast.success("MFA enabled");
      await refresh();
    } catch (err) {
      toast.error("Verification failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set up multi-factor authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with an authenticator app (Google Authenticator, 1Password, Authy),
            then enter the 6-digit code it generates to confirm enrollment.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 text-center text-[12.5px] text-muted-foreground">
            Generating your setup key…
          </div>
        )}

        {!loading && setup && !verified && (
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg border border-border bg-surface-muted/40 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qrCodeDataUrl} alt="MFA setup QR code" className="h-44 w-44" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11.5px] font-medium text-muted-foreground">
                Can&apos;t scan? Enter this key manually
              </Label>
              <div className="rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-center font-mono text-[12.5px] tracking-wider">
                {setup.manualKey}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mfa-code" className="text-[11.5px] font-medium text-muted-foreground">
                6-digit code
              </Label>
              <Input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-[16px] tracking-[0.3em]"
              />
            </div>
          </div>
        )}

        {verified && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ShieldCheck className="h-8 w-8 text-success" />
            <div className="text-[13px] font-medium">MFA enabled</div>
            <p className="max-w-xs text-[11.5px] text-muted-foreground">
              Your authenticator app is enrolled and multi-factor authentication is now on for
              your account.
            </p>
          </div>
        )}

        <DialogFooter>
          {verified ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={verifying}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={!setup || code.length !== 6 || verifying}>
                {verifying ? "Verifying…" : "Verify"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
