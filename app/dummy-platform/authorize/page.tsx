"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ShieldQuestion, Sparkles } from "lucide-react";
import { DummyPlatformLogo } from "../_components";

function AuthorizeScreen() {
  const searchParams = useSearchParams();
  const clientName = searchParams.get("client_name") || searchParams.get("client_id") || "An app";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const scopes = (searchParams.get("scope") || "").split("|").filter(Boolean);
  const [busy, setBusy] = useState<"allow" | "deny" | null>(null);

  const respond = (decision: "allow" | "deny") => {
    setBusy(decision);
    window.setTimeout(() => {
      if (!redirectUri) return;
      const url = new URL(redirectUri);
      url.searchParams.set(decision === "allow" ? "connected" : "denied", "1");
      window.location.href = url.toString();
    }, 550);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-[var(--dp-border)] bg-[var(--dp-surface)] p-7 shadow-[0_20px_50px_-20px_rgba(109,40,217,0.35)]">
        <div className="flex items-center justify-center">
          <DummyPlatformLogo />
        </div>

        <div className="mt-6 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--dp-brand)]/10 text-[var(--dp-brand)]">
            <ShieldQuestion className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-[17px] font-semibold text-[var(--dp-ink)]">
            {clientName} wants to access your Dummy Platform account
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--dp-muted)]">
            Review what {clientName} can do before you authorize the connection.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--dp-border)] bg-[var(--dp-bg)] p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--dp-muted)]">
            This will allow {clientName} to
          </div>
          <div className="mt-3 space-y-2.5">
            {(scopes.length ? scopes : ["Access your account"]).map((scope) => (
              <div key={scope} className="flex items-start gap-2 text-[12.5px] text-[var(--dp-ink)]">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--dp-brand)]" />
                <span>{scope}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--dp-brand)]/5 p-3 text-[11.5px] text-[var(--dp-muted)]">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--dp-brand)]" />
          Demo connector — no real Dummy Platform account or data is involved.
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => respond("deny")}
            disabled={busy !== null}
            className="h-10 flex-1 rounded-lg border border-[var(--dp-border)] text-[13px] font-medium text-[var(--dp-ink)] transition-opacity hover:bg-[var(--dp-bg)] disabled:opacity-60"
          >
            {busy === "deny" ? "Redirecting…" : "Deny"}
          </button>
          <button
            onClick={() => respond("allow")}
            disabled={busy !== null}
            className="h-10 flex-1 rounded-lg bg-[var(--dp-brand)] text-[13px] font-medium text-[var(--dp-brand-ink)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy === "allow" ? "Redirecting…" : "Allow access"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense>
      <AuthorizeScreen />
    </Suspense>
  );
}
