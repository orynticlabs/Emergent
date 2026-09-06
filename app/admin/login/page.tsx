"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Lock, Mail, Shield, ShieldCheck, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { onAutofillSync } from "@/lib/utils";

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "Session-based auth",
    body: "Only an HTTP-only session cookie is set after sign-in. Credentials never touch the browser.",
  },
  {
    icon: Lock,
    title: "bcrypt passwords",
    body: "Passwords are stored as adaptive bcrypt hashes. Plaintext is never persisted.",
  },
  {
    icon: Shield,
    title: "30-day sessions",
    body: "Sessions expire automatically. Sign out at any time to invalidate immediately.",
  },
];

type Step = "login" | "forgot" | "mfa";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // MFA challenge state — the challenge token lives ONLY here, in memory.
  // Never written to a cookie, localStorage, sessionStorage, or the URL, and
  // never logged. It's cleared on "back", on any MFA failure, and once the
  // real session cookie is set by the server.
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "mfa") codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    fetch("/api/orycms/auth/setup-status")
      .then((r) => r.json())
      .then((data: { success: boolean; data?: { initialized: boolean } }) => {
        if (data.success && !data.data?.initialized) router.replace("/admin/setup");
      })
      .catch(() => {});
  }, [router]);

  // Shared by both the non-MFA login success path and the post-MFA-verify
  // success path, so the redirect behaves identically either way.
  const redirectAfterLogin = () => {
    const from = searchParams.get("from") ?? "";
    // Only use `from` when it's a safe same-origin relative path
    const dest = from && from.startsWith("/") && !from.startsWith("//") ? from : "/admin";
    router.push(dest);
  };

  const handleSignIn = async () => {
    if (isSubmitting) return;

    // Browser/password-manager autofill sets the input's DOM value directly
    // without firing the "input" event React listens to, so `email`/
    // `password` state can lag behind what's actually in the fields (see
    // onAutofillSync in lib/utils.ts). Read the DOM value as the source of
    // truth at submit time so autofilled credentials always work.
    const emailValue = emailRef.current?.value.trim() || email;
    const passwordValue = passwordRef.current?.value || password;

    if (!emailValue || !passwordValue) {
      setError("Email and password are required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orycms/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: { mfaRequired?: boolean; challengeToken?: string };
        error?: { message: string };
      };
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? "Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      if (data.data?.mfaRequired && data.data.challengeToken) {
        setChallengeToken(data.data.challengeToken);
        setMfaCode("");
        setStep("mfa");
        setIsSubmitting(false);
        return;
      }

      redirectAfterLogin();
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) handleSignIn();
  };

  // Discards the in-memory challenge and returns to the password screen.
  // No server call — no session exists yet, so there's nothing to log out of.
  const handleBackToLogin = () => {
    if (isVerifying) return;
    setChallengeToken(null);
    setMfaCode("");
    setError(null);
    setStep("login");
  };

  // Ends the MFA attempt on the client and returns to the password screen
  // with a message — used for "too many attempts" and "expired/invalid
  // challenge" outcomes, which both require a fresh password + challenge.
  const failMfaChallenge = (message: string) => {
    setChallengeToken(null);
    setMfaCode("");
    setStep("login");
    setError(message);
    setIsVerifying(false);
  };

  const handleVerifyMfa = async () => {
    if (isVerifying || !challengeToken || mfaCode.length !== 6) return;

    setError(null);
    setIsVerifying(true);
    try {
      const res = await fetch("/api/orycms/auth/mfa/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: mfaCode }),
      });
      const data = (await res.json()) as { success: boolean };

      if (res.ok && data.success) {
        // Server has set the session cookie — nothing to do here but redirect.
        redirectAfterLogin();
        return;
      }

      if (res.status === 422) {
        // Wrong code — same challenge, let the user retry.
        setError("Invalid verification code. Please try again.");
        setMfaCode("");
        setIsVerifying(false);
        codeRef.current?.focus();
        return;
      }

      if (res.status === 429) {
        failMfaChallenge("Too many incorrect codes. Please sign in again.");
        return;
      }

      // Expired/invalid challenge, or anything else — start over from
      // password. Deliberately generic: never surface server error detail.
      failMfaChallenge("Your session expired. Please sign in again.");
    } catch {
      failMfaChallenge("Network error. Please sign in again.");
    }
  };

  const onMfaKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isVerifying && mfaCode.length === 6) handleVerifyMfa();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Left panel – desktop only ───────────────────────────────── */}
      <aside className="relative hidden overflow-hidden border-r border-border lg:flex lg:w-[52%] lg:flex-col lg:justify-between xl:w-[55%]">
        {/* decorative backgrounds */}
        <div className="absolute inset-0 bg-surface-muted/60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/60 to-transparent" />

        {/* content */}
        <div className="relative flex flex-1 flex-col justify-between px-10 py-10">
          {/* brand */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Image src="/orycms/img/favicon.png" alt="OryCMS logo" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
              <div>
                <div className="text-[18px] font-semibold tracking-tight">OryCMS</div>
                <div className="text-[12px] text-muted-foreground">
                  By OrynticLabs Private Limited
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-border bg-surface/80 px-3 py-1 text-[11px]">
              Secure admin access
            </Badge>
          </div>

          {/* headline + trust */}
          <div className="max-w-[500px]">
            <h1 className="mt-3 text-[36px] font-semibold leading-tight tracking-tight xl:text-[42px]">
              Sign in to manage clients, projects, and delivery.
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              This is OrynticLabs' internal console for running client engagements, project
              delivery, and the marketing site — reserved for our team. Enter your credentials to
              continue.
            </p>

            <div className="mt-8 grid gap-3">
              {trustSignals.map((s) => {
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

          {/* footer */}
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
            <span>30-day sessions</span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span>HTTP-only cookies</span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span>bcrypt hashing</span>
          </div>
        </div>
      </aside>

      {/* ── Right panel – form ──────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* mobile brand */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
          <Image src="/orycms/img/favicon.png" alt="OryCMS logo" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
          <div>
            <div className="text-[20px] font-semibold tracking-tight">OryCMS</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              by OrynticLabs Private Limited
            </div>
          </div>
        </div>

        {/* card */}
        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_60px_-20px_rgba(20,24,31,0.18)] lg:p-8">
          {step === "login" ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight">Welcome back</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Sign in with your workspace credentials.
                  </p>
                </div>
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
                  <Lock className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 space-y-4" onKeyDown={onKey}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onAnimationStart={onAutofillSync(setEmail)}
                      className="h-10 pl-10"
                      placeholder="you@company.com"
                      autoComplete="email"
                      autoFocus
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep("forgot");
                      }}
                      className="text-[11.5px] text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput
                    id="password"
                    ref={passwordRef}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onAnimationStart={onAutofillSync(setPassword)}
                    className="h-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    suppressHydrationWarning
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[12.5px] text-destructive">
                    {error}
                  </div>
                )}

                <Button className="mt-1 h-10 w-full" onClick={handleSignIn} disabled={isSubmitting}>
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </div>

              <div className="mt-5">
                <Separator className="mb-5" />
                <p className="text-center text-[12px] text-muted-foreground">
                  No account?{" "}
                  <span className="font-medium text-foreground/70">
                    Contact your workspace owner for an invite.
                  </span>
                </p>
              </div>
            </>
          ) : step === "mfa" ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight">Two-factor verification</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                </div>
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 space-y-4" onKeyDown={onMfaKey}>
                <div className="space-y-1.5">
                  <Label htmlFor="mfa-code">Authenticator code</Label>
                  <Input
                    id="mfa-code"
                    ref={codeRef}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-10 text-center text-[16px] tracking-[0.3em]"
                    disabled={isVerifying}
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[12.5px] text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  className="mt-1 h-10 w-full"
                  onClick={handleVerifyMfa}
                  disabled={isVerifying || mfaCode.length !== 6}
                >
                  {isVerifying ? "Verifying…" : "Verify"}
                </Button>

                <Button
                  variant="outline"
                  className="h-10 w-full"
                  onClick={handleBackToLogin}
                  disabled={isVerifying}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight">Forgot password?</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Ask your administrator to reset your account.
                  </p>
                </div>
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
                  <KeyRound className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border bg-surface-muted/60 p-4 text-[13px] leading-relaxed text-muted-foreground">
                  Self-service password reset is not yet available. Ask your workspace administrator
                  to reset your account from{" "}
                  <span className="font-medium text-foreground/80">Settings → Users</span>.
                </div>

                <Button variant="outline" className="h-10 w-full" onClick={() => setStep("login")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
