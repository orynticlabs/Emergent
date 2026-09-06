"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TEAM_ROLES } from "@site/data/content";
import { Reveal, KineticLine } from "@site/components/site/Reveal";
import { AnimatedTooltip } from "@site/components/ui/animated-tooltip";

/**
 * Site-wide closing CTA, shown on every page (rendered from SiteShell, just
 * above the footer) — not page-specific content. Headline reveals line by
 * line via KineticLine, the same mechanism the home/hero headlines use,
 * instead of the whole line appearing at once.
 */
export default function BuildTogetherCTA() {
  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="build-together-cta">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
              <KineticLine delay={0.05}>Let&apos;s build something real.</KineticLine>
              <KineticLine delay={0.15}>
                <span className="text-brand-orange">Together.</span>
              </KineticLine>
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
                Tell us what you&apos;re building and hear back from our team within 24 hours — no sales
                queue, no ticket number.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center">
                  <AnimatedTooltip items={TEAM_ROLES} />
                </div>
                <p className="text-sm text-white/50">One team across 11 industries, 3 products in production.</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <Link
              href="/contact-us"
              data-testid="build-together-cta-book-call"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-bold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(255,85,0,0.55)] transition-colors duration-300 hover:bg-[#e04a00]"
            >
              Book a call
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
