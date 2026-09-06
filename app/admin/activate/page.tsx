"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OryCMSSpinner } from "@/components/ui/orycms-loader";

type Status = "pending" | "success" | "error";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This activation link is missing its token.");
      return;
    }
    let cancelled = false;
    fetch("/api/orycms/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { success: boolean; error?: { message: string } };
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data.error?.message ?? "This activation link is invalid or has expired.");
          return;
        }
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_20px_60px_-20px_rgba(20,24,31,0.18)]">
        {status === "pending" && (
          <>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent text-foreground">
              <OryCMSSpinner className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[20px] font-semibold tracking-tight">Activating your account…</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">This will only take a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[20px] font-semibold tracking-tight">Account activated</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Your account is now active. Sign in to continue.
            </p>
            <Button className="mt-6 h-10 w-full" onClick={() => router.replace("/admin/login")}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Go to sign in
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[20px] font-semibold tracking-tight">Activation failed</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">{message}</p>
            <Button
              variant="outline"
              className="mt-6 h-10 w-full"
              onClick={() => router.replace("/admin/login")}
            >
              Back to sign in
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateContent />
    </Suspense>
  );
}
