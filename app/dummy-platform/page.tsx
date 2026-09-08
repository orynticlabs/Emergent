"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, PlugZap } from "lucide-react";
import { DummyPlatformLogo } from "./_components";

export default function DummyPlatformHome() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(window.localStorage.getItem("orycms.integration.dummy-platform") === "connected");
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--dp-border)] bg-[var(--dp-surface)]">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-4">
          <DummyPlatformLogo size="sm" />
          <nav className="flex items-center gap-5 text-[12.5px] font-medium text-[var(--dp-muted)]">
            <span className="text-[var(--dp-ink)]">Connected apps</span>
            <span>Docs</span>
            <span>Support</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-6 py-10">
        <div className="text-[12px] font-medium uppercase tracking-wide text-[var(--dp-brand)]">
          Developer console
        </div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--dp-ink)]">
          Connected apps
        </h1>
        <p className="mt-1.5 max-w-[560px] text-[13.5px] leading-relaxed text-[var(--dp-muted)]">
          Third-party apps you&apos;ve authorized to access your Dummy Platform account. This is the
          Dummy Platform side of the OryCMS integration demo.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--dp-border)] bg-[var(--dp-surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#101828] text-white">
                <span className="text-[13px] font-bold">Ory</span>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[var(--dp-ink)]">OryCMS</div>
                <div className="text-[12px] text-[var(--dp-muted)]">by Oryntic Labs Private Limited</div>
              </div>
            </div>

            {connected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                Connected
              </span>
            ) : (
              <span className="rounded-full bg-[var(--dp-bg)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--dp-muted)]">
                Not connected
              </span>
            )}
          </div>

          {connected && (
            <div className="mt-4 space-y-2 border-t border-[var(--dp-border)] pt-4 text-[12.5px] text-[var(--dp-muted)]">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--dp-brand)]" />
                Read store catalog
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--dp-brand)]" />
                Read order events
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--dp-brand)]" />
                Send fulfillment webhooks
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--dp-border)] pt-4">
            <Link
              href="/admin/plugins/dummy-platform"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--dp-brand)] px-3 text-[12.5px] font-medium text-[var(--dp-brand-ink)] hover:opacity-90"
            >
              <PlugZap className="h-3.5 w-3.5" />
              {connected ? "Manage in OryCMS" : "Connect from OryCMS"}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-[11.5px] text-[var(--dp-muted)]">
          Start the connect flow from{" "}
          <Link href="/admin/plugins/dummy-platform" className="underline underline-offset-2">
            OryCMS → Integrations → Dummy Platform
          </Link>
          . This page reflects whatever authorization decision was made there.
        </p>
      </div>
    </main>
  );
}
