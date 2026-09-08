"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Repeat, Globe2, Wallet, MessagesSquare, FileCheck2, Check, ArrowRight, ArrowUpRight,
} from "lucide-react";
import { Reveal, SectionHead, KineticLine, ArrowLink, EASE, Magnetic } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";
import SpotlightCard from "@site/components/site/SpotlightCard";
import FAQGrid from "@site/components/site/FAQGrid";
import { Timeline } from "@site/components/ui/timeline";
import { IMAGES } from "@site/data/content";
import { ROLES, ENGAGEMENT_MODELS, HIRE_STAFF_FAQS } from "./hire-staff-data";
import HireStaffRequestModal from "./HireStaffRequestModal";

/*
 * "Hire Staff" - staff augmentation / dedicated-team landing page. Hero and
 * bold-text treatment deliberately match the home/about pages exactly
 * (full-bleed photo, floating blur orbs, KineticLine headline reveal,
 * CanvasText gradient accent) instead of the shorter, boxed `PageHero`
 * most inner service pages use - this page is meant to read as a primary
 * landing page, not a generic sub-page.
 *
 * Role cards below are adapted from 21st.dev's "Freelancer Profile Card"
 * pattern (banner + avatar + stats + CTA) - literal source wasn't pulled
 * (paid component), built from the pattern with our own Pexels-headshot
 * placeholder convention, not copied code. The "How hiring works" section
 * uses the existing Aceternity-style Timeline component already in this
 * codebase (app/(site)/_shared/components/ui/timeline.jsx). The engagement
 * tiers below are adapted from 21st.dev's "Startup Pricing Plans" pattern
 * (feature-checklist cards, one highlighted) with custom-quote framing
 * instead of literal prices, since engagement cost depends on role/scope.
 */

const WHY_HIRE = [
  { icon: Repeat, title: "No recruitment overhead", description: "Skip weeks of sourcing, screening, and technical interviews. We've already vetted the engineer." },
  { icon: FileCheck2, title: "Full IP ownership", description: "Everything built during the engagement is yours outright - code, designs, documentation." },
  { icon: Globe2, title: "Real timezone overlap", description: "Engineers work hours that overlap with your team, not a handoff across a 12-hour gap." },
  { icon: ShieldCheck, title: "Free replacement", description: "If an engineer isn't the right fit, we replace them at no extra cost - no long negotiation." },
  { icon: Wallet, title: "Payroll & compliance handled", description: "We're the employer of record. No separate contracts, payroll, or local compliance for you to manage." },
  { icon: MessagesSquare, title: "Direct access, not a proxy", description: "You're on Slack and in standups with the engineer directly - not relayed through an account manager." },
];

const HIRING_STEPS = [
  {
    title: "Share requirements",
    content: (
      <p className="text-sm leading-relaxed text-white/60 md:text-base">
        Tell us the role, stack, timezone, and how long you need the capacity for - a 15-minute
        call or a short brief is enough for us to start matching.
      </p>
    ),
  },
  {
    title: "Shortlist in 48 hours",
    content: (
      <p className="text-sm leading-relaxed text-white/60 md:text-base">
        We match against engineers already vetted on technical depth and communication - you get
        2–3 real profiles, not a stack of resumes to screen yourself.
      </p>
    ),
  },
  {
    title: "Interview & select",
    content: (
      <p className="text-sm leading-relaxed text-white/60 md:text-base">
        Talk directly to the engineer who'd join your team, not a recruiter reading from a script.
        You decide who's the right fit.
      </p>
    ),
  },
  {
    title: "Onboard & start shipping",
    content: (
      <p className="text-sm leading-relaxed text-white/60 md:text-base">
        Access to your repos, tools, and standups from day one. Most engagements start shipping
        inside the first week.
      </p>
    ),
  },
  {
    title: "Scale anytime",
    content: (
      <p className="text-sm leading-relaxed text-white/60 md:text-base">
        Add more capacity, scale down, or swap a role - month to month, with no long-term
        lock-in contract.
      </p>
    ),
  },
];

/** Same visual/motion output as `ArrowLink`, but a click handler instead of a route - for CTAs that open the popup form rather than navigate. */
function ArrowButton({ children, onClick, variant = "primary", className = "" }) {
  const styles =
    variant === "primary"
      ? "bg-brand-orange text-white hover:bg-[#e04a00]"
      : variant === "blue"
        ? "bg-brand-blue text-white hover:bg-[#0052cc]"
        : "border border-current hover:bg-white/10";
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
      <button
        type="button"
        onClick={onClick}
        data-testid={`cta-${String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 ${styles} ${className}`}
      >
        {children}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </motion.div>
  );
}

function RoleCard({ role, index, onRequest }) {
  return (
    <Reveal delay={0.06 * index}>
      <SpotlightCard tint={index % 2 === 0 ? "255,85,0" : "0,102,255"} className="group" data-testid={`hire-role-card-${index}`}>
        <div className="relative h-24 shrink-0 bg-gradient-to-br from-brand-orange/25 via-brand-blue/15 to-transparent">
          <div className="absolute -bottom-8 left-7 h-16 w-16 overflow-hidden rounded-2xl border-4 border-brand-ink shadow-lg">
            <img src={role.image} alt={role.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-7 pt-12">
          <h3 className="font-display text-lg font-bold tracking-tight text-white">{role.title}</h3>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-white/55">{role.blurb}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {role.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium text-white/55">
                {t}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onRequest(role.title)}
            data-testid={`hire-role-cta-${index}`}
            className="group/cta relative z-10 mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-blue transition-colors duration-300 hover:text-brand-orange"
          >
            Request this role
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
          </button>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

function HireStaffHero({ onStartHiring }) {
  return (
    <section data-testid="page-hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white">
      <img src={IMAGES.culture} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#050505]/65" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/30 to-[#050505]" aria-hidden="true" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-brand-orange/20 blur-[110px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-brand-blue/20 blur-[120px]"
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-36 pb-28 text-center md:px-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/60" data-testid="hero-overline">
            Oryntic Labs - Hire Staff
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
          <KineticLine delay={0.15}>Hire Vetted Engineers,</KineticLine>
          <KineticLine delay={0.27}>
            <CanvasText
              text="Not Resumes."
              className="font-display text-5xl font-black sm:text-6xl lg:text-7xl"
              colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
              lineGap={6}
              animationDuration={10}
            />
          </KineticLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-white/65"
        >
          Add pre-vetted software engineers, mobile developers, AI/ML specialists, and DevOps
          engineers to your team - staff augmentation, a dedicated pod, or project-based delivery.
          Shortlist in 48 hours, full IP ownership, no long-term lock-in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ArrowButton onClick={onStartHiring}>Start Hiring</ArrowButton>
          </Magnetic>
          <Magnetic strength={12}>
            <ArrowLink to="#hire-staff-engagement-models" variant="ghost" className="border-white/30 text-white backdrop-blur-md">
              View Engagement Models
            </ArrowLink>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

export default function HireStaffClient() {
  const [formOpen, setFormOpen] = useState(false);
  const [formPrefill, setFormPrefill] = useState({});

  const openForm = (prefill = {}) => {
    setFormPrefill(prefill);
    setFormOpen(true);
  };

  return (
    <main data-testid="hire-staff-page">
      <HireStaffRequestModal open={formOpen} onClose={() => setFormOpen(false)} prefill={formPrefill} />

      <HireStaffHero onStartHiring={() => openForm()} />

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="hire-staff-roles">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Roles you can hire"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title={
              <>
                Engineers we place,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">not job titles we invent.</span>
              </>
            }
            description="Every profile is vetted on real production experience - the same bar we hold our own engineers to."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((role, i) => (
              <RoleCard key={role.id} role={role} index={i} onRequest={(roleTitle) => openForm({ role: roleTitle })} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="hire-staff-process">
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-[36rem] rounded-full bg-brand-blue/10 blur-[140px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="How hiring works"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title={
              <>
                From brief to shipping,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">in days, not months.</span>
              </>
            }
          />
        </div>
        <div className="mt-4">
          <Timeline data={HIRING_STEPS} />
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="hire-staff-why">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            overline="Why hire through Oryntic Labs"
            title={
              <>
                What you skip
                <br className="hidden sm:block" />
                <span className="text-brand-orange">by not hiring directly.</span>
              </>
            }
            description="Everything a full-time hire usually costs you in time and overhead, minus the overhead."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_HIRE.map((w, i) => (
              <Reveal key={w.title} delay={0.06 * i}>
                <SpotlightCard tint={i % 2 === 0 ? "255,85,0" : "0,102,255"} className="p-7" data-testid={`hire-why-card-${i}`}>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    <w.icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-bold tracking-tight text-white">{w.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-white/55">{w.description}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="hire-staff-engagement-models" className="bg-brand-ink py-24 text-white md:py-32" data-testid="hire-staff-engagement-models">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            overline="Engagement models"
            title={
              <>
                Pick the model
                <br className="hidden sm:block" />
                <span className="text-brand-orange">that fits how you work.</span>
              </>
            }
            description="Every engagement is custom-quoted against your scope - these are the three shapes it usually takes."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {ENGAGEMENT_MODELS.map((m, i) => (
              <Reveal key={m.title} delay={0.08 * i}>
                <div
                  data-testid={`hire-staff-tier-${i}`}
                  className={`relative flex h-full flex-col rounded-3xl border p-8 transition-all duration-300 ${
                    m.highlighted
                      ? "border-brand-orange bg-gradient-to-b from-brand-orange/10 to-transparent shadow-[0_30px_70px_-30px_rgba(255,85,0,0.35)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  {m.highlighted && (
                    <span className="absolute -top-3 left-8 rounded-full bg-brand-orange px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      Most flexible
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold tracking-tight text-white">{m.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">{m.tagline}</p>
                  <ul className="mt-7 flex-1 space-y-3">
                    {m.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openForm({ engagementModel: m.title })}
                    data-testid={`hire-staff-tier-cta-${i}`}
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300 ${
                      m.highlighted
                        ? "bg-brand-orange text-white hover:bg-[#e04a00]"
                        : "border border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                    }`}
                  >
                    {m.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FAQGrid
        testId="hire-staff-faq"
        overline="Frequently asked questions"
        titleClassName="text-2xl md:text-5xl uppercase"
        title={
          <>
            Before you
            <br className="hidden sm:block" />
            <span className="text-brand-orange">get on a call.</span>
          </>
        }
        description="Everything you need to know about how our engineers embed into your team, pricing models, and IP protection."
        items={HIRE_STAFF_FAQS}
      />

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="hire-staff-cta">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <SectionHead
            align="center"
            titleClassName="text-2xl md:text-5xl"
            wrapperClassName="max-w-2xl"
            overline="Ready to hire"
            title={
              <>
                Tell us the role.
                <br />
                <CanvasText
                  text="We'll bring the shortlist."
                  className="font-display text-2xl font-black md:text-5xl"
                  colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
                  lineGap={6}
                  animationDuration={10}
                />
              </>
            }
            description="A short call is enough for us to start matching engineers to your stack, timezone, and timeline."
          />
          <div className="mt-8 flex justify-center">
            <ArrowButton onClick={() => openForm()} variant="blue">Start hiring</ArrowButton>
          </div>
        </div>
      </section>
    </main>
  );
}
