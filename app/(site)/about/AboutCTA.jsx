"use client";

import Link from "next/link";
import { ArrowRight, Code2, Smartphone, BrainCircuit, Cloud, Palette, ClipboardCheck } from "lucide-react";
import { Reveal } from "@site/components/site/Reveal";
import { AnimatedTooltip } from "@site/components/ui/animated-tooltip";

const TEAM_ROLES = [
  { id: 1, name: "Frontend & Backend", designation: "Full-stack engineers", icon: Code2, className: "bg-brand-orange" },
  { id: 2, name: "Mobile", designation: "iOS, Android & cross-platform", icon: Smartphone, className: "bg-brand-blue" },
  { id: 3, name: "AI & ML", designation: "Agents, RAG, model training", icon: BrainCircuit, className: "bg-violet-500" },
  { id: 4, name: "Cloud & DevOps", designation: "AWS, GCP, Azure, CI/CD", icon: Cloud, className: "bg-sky-500" },
  { id: 5, name: "Product Design", designation: "UI/UX, design systems", icon: Palette, className: "bg-pink-500" },
  { id: 6, name: "QA", designation: "Testing & quality assurance", icon: ClipboardCheck, className: "bg-emerald-500" },
];

export default function AboutCTA() {
  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-final-cta">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          <Reveal>
            <p className="font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Let&apos;s build something real. <span className="text-brand-orange">Together.</span>
            </p>
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

          <Reveal delay={0.15}>
            <Link
              href="/contact-us"
              data-testid="about-cta-book-call"
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
