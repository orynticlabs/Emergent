"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Plus, Code2, Smartphone, BrainCircuit, Cloud, Palette, ClipboardCheck } from "lucide-react";
import { Reveal } from "@site/components/site/Reveal";
import { AnimatedTooltip } from "@site/components/ui/animated-tooltip";

function Corner({ className }) {
  return <Plus className={`absolute h-3.5 w-3.5 text-white/25 ${className}`} strokeWidth={1.5} aria-hidden="true" />;
}

// Who actually picks up — the real roles on a staff-augmentation or delivery
// team, not invented individuals. Shown as roles, not named "team photos".
const TEAM_ROLES = [
  { id: 1, name: "Frontend & Backend", designation: "Full-stack engineers", icon: Code2, className: "bg-brand-orange" },
  { id: 2, name: "Mobile", designation: "iOS, Android & cross-platform", icon: Smartphone, className: "bg-brand-blue" },
  { id: 3, name: "AI & ML", designation: "Agents, RAG, model training", icon: BrainCircuit, className: "bg-violet-500" },
  { id: 4, name: "Cloud & DevOps", designation: "AWS, GCP, Azure, CI/CD", icon: Cloud, className: "bg-sky-500" },
  { id: 5, name: "Product Design", designation: "UI/UX, design systems", icon: Palette, className: "bg-pink-500" },
  { id: 6, name: "QA", designation: "Testing & quality assurance", icon: ClipboardCheck, className: "bg-emerald-500" },
];

export default function LetsTalkSection() {
  return (
    <section data-testid="home-lets-talk" className="bg-brand-ink px-6 py-20 text-white md:px-10 md:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-7xl border border-dashed border-white/15">
          <Corner className="-left-[7px] -top-[7px]" />
          <Corner className="-right-[7px] -top-[7px]" />
          <Corner className="-left-[7px] -bottom-[7px]" />
          <Corner className="-right-[7px] -bottom-[7px]" />

          <div className="grid md:grid-cols-2">
            <div className="border-b border-dashed border-white/15 p-8 md:border-b-0 md:border-r md:p-14">
              <h2 className="font-display text-2xl font-medium leading-snug tracking-tight text-white md:text-4xl">
                Ship your next system with the <span className="font-bold">speed of a team that already knows it.</span>
              </h2>
              <p className="mt-5 font-display text-2xl font-medium leading-snug tracking-tight text-white/70 md:text-4xl">
                Get senior engineers on <span className="text-brand-blue">strategy</span>, not just execution, with{" "}
                <span className="text-brand-orange">AI</span> built in from day one.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact-us"
                  data-testid="lets-talk-primary-cta"
                  className="group inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#e04a00]"
                >
                  Start a Project
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact-us"
                  data-testid="lets-talk-secondary-cta"
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  Talk to us
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="p-8 md:p-14">
              <p className="font-display text-lg leading-relaxed text-white/80 md:text-xl">
                &quot;You&apos;ll talk to the person actually building your product — not a sales rep
                reading from a script, and not a junior team once the contract is signed.&quot;
              </p>
              <p className="mt-6 font-semibold text-white">OrynticLabs Team</p>
              <p className="text-sm text-white/45">Founders and engineers, on every call</p>

              <div className="mt-8 flex flex-row items-center">
                <AnimatedTooltip items={TEAM_ROLES} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
