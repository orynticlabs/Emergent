"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Lock, Shield, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { onAutofillSync } from "@/lib/utils";

const signals = [
  {
    icon: UserPlus,
    title: "You've been invited",
    body: "Set a password to activate your account and join the workspace.",
  },
  {
    icon: Lock,
    title: "Secure by default",
    body: "Passwords are hashed with bcrypt (cost 12) — never stored in plain text.",
  },
  {
    icon: Shield,
    title: "One-time link",
    body: "This invite link can only be used once and expires after a few days.",
  },
];

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = !!token && password.length >= 8 && password === confirm && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orycms/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? "This invite link is invalid or has expired.");
        setIsSubmitting(false);
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit) handleSubmit();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="relative hidden overflow-hidden border-r border-border lg:flex lg:w-[52%] lg:flex-col lg:justify-between xl:w-[55%]">
        <div className="absolute inset-0 bg-surface-muted/60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/60 to-transparent" />

        <div className="relative flex flex-1 flex-col justify-between px-10 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[18px] font-semibold tracking-tight">OryCMS</div>
              <div className="text-[12px] text-muted-foreground">By OrynticLabs Private Limited</div>
            </div>
            <Badge variant="outline" className="border-border bg-surface/80 px-3 py-1 text-[11px]">
              Accept invite
            </Badge>
          </div>

          <div className="max-w-[500px]">
            <p className="text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
              Join your workspace
            </p>
            <h1 className="mt-3 text-[36px] font-semibold leading-tight tracking-tight xl:text-[42px]">
              Set your password to get started.
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              You've been invited to an OryCMS workspace. Choose a password below to activate your
              account.
            </p>

            <div className="mt-8 grid gap-3">
              {signals.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="flex gap-3 rounded-xl border border-border bg-surface/80 p-4 shadow-xs backdrop-blur-sm"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{s.title}</div>
                      <div className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                        {s.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>You'll be signed in automatically once your password is set.</span>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="mb-8 text-center lg:hidden">
          <div className="text-[20px] font-semibold tracking-tight">OryCMS</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">by OrynticLabs Private Limited</div>
        </div>

        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_60px_-20px_rgba(20,24,31,0.18)] lg:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">Accept invite</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Choose a password to continue.</p>
            </div>
            <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>

          {!token ? (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-[13px] leading-relaxed text-destructive">
              This invite link is missing its token. Ask whoever invited you to resend the invite.
            </div>
          ) : (
            <div className="mt-6 space-y-4" onKeyDown={onKey}>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onAnimationStart={onAutofillSync(setPassword)}
                  className="h-10"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  autoFocus
                  suppressHydrationWarning
                />
                {password.length > 0 && password.length < 8 && (
                  <p className="text-[12px] text-warning">Use at least 8 characters.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <PasswordInput
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onAnimationStart={onAutofillSync(setConfirm)}
                  className="h-10"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  suppressHydrationWarning
                />
                {passwordMismatch && (
                  <p className="text-[12px] text-destructive">Passwords do not match.</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[12.5px] text-destructive">
                  {error}
                </div>
              )}

              <Button className="mt-1 h-10 w-full" onClick={handleSubmit} disabled={!canSubmit}>
                {isSubmitting ? "Setting up your account…" : "Accept invite & sign in"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
