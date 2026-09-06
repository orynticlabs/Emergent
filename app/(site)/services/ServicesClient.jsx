"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Compass, ArrowUpRight, ArrowRight } from "lucide-react";
import { SERVICES, PROCESS, IMAGES } from "@site/data/content";
import { Reveal, SectionHead, KineticLine, ArrowLink, EASE, Magnetic } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";
import { BentoGrid, BentoCard } from "@site/components/site/BentoGrid";
import { Timeline } from "@site/components/ui/timeline";
import SpotlightCard from "@site/components/site/SpotlightCard";

/*
 * Services — hero and bold-text treatment match the home page exactly
 * (full-bleed photo, floating blur orbs, KineticLine headline reveal,
 * CanvasText gradient accent), same as /about and /hire-staff, instead of
 * the shorter, boxed `PageHero` most inner pages used previously.
 *
 * The eight practices below render through the shared `BentoGrid` (adapted
 * from Aceternity/Magic UI's Bento Grid, 21st.dev — see BentoGrid.jsx's own
 * comment) with Web Development and AI & Machine Learning as the two
 * featured tiles — our most-delivered and most-differentiated practices.
 * "How we work" reuses the Aceternity-style Timeline component (already in
 * this codebase, first used on /hire-staff) instead of a plain bordered
 * list, so the same scroll-filled rail treatment reads consistently across
 * both pages.
 */

// Services with a dedicated detail page — the rest of the grid stays informational-only.
const SERVICE_DETAIL_HREF = { mobile: "/services/mobile-development" };
const FEATURED_IDS = new Set(["web", "ai"]);

function ServicesHero() {
  return (
    <section data-testid="page-hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white">
      <img src={IMAGES.datacenter} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
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
            OrynticLabs — Services
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
          <KineticLine delay={0.15}>Everything Software</KineticLine>
          <KineticLine delay={0.27}>
            <CanvasText
              text="Demands."
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
          Eight practices across the complete software lifecycle — web development, product
          development, custom software, mobile apps, AI &amp; machine learning, data &amp;
          analytics, cloud infrastructure, and UI/UX design — plus staff augmentation and
          technology consulting for teams that need talent or advisory support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ArrowLink to="/contact-us">Talk to Our Team</ArrowLink>
          </Magnetic>
          <Magnetic strength={12}>
            <ArrowLink to="/portfolio" variant="ghost" className="border-white/30 text-white backdrop-blur-md">
              See the Work
            </ArrowLink>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

export default function ServicesClient() {
  return (
    <main data-testid="services-page">
      <ServicesHero />

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="services-grid-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="What we do"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title="Eight practices, one accountable team."
            description="Every engagement draws from the same in-house bench — no subcontracted vendors relaying work between companies."
          />
          <BentoGrid className="mt-14">
            {SERVICES.map((s) => {
              const href = SERVICE_DETAIL_HREF[s.id] || "/contact-us";
              const featured = FEATURED_IDS.has(s.id);
              return (
                <BentoCard
                  key={s.id}
                  title={s.title}
                  description={s.blurb}
                  href={href}
                  cta={SERVICE_DETAIL_HREF[s.id] ? "Explore practice" : "Talk to us"}
                  icon={s.icon}
                  tint={featured ? "0,102,255" : "255,85,0"}
                  featured={featured}
                />
              );
            })}
          </BentoGrid>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="services-process">
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-blue/15 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="How we work"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title="The same discipline, every engagement."
            description="Whether it's a small web build or a multi-year product partnership, the foundational approach never changes."
          />
        </div>
        <div className="mt-4">
          <Timeline
            data={PROCESS.map((step) => ({
              title: step.title,
              content: (
                <p className="text-sm leading-relaxed text-white/60 md:text-base">{step.text}</p>
              ),
            }))}
          />
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="services-staffing">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Resource services"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title="Technology talent, without the overhead."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal>
              <Link href="/hire-staff" data-testid="staff-augmentation-card" className="group block h-full">
                <SpotlightCard tint="255,85,0" className="h-full p-10 md:p-12">
                  <Users className="h-10 w-10 text-brand-orange" strokeWidth={1.5} />
                  <h3 className="mt-8 font-display text-2xl md:text-3xl font-bold tracking-tight text-white">Staff Augmentation</h3>
                  <p className="mt-4 flex-1 leading-relaxed text-white/55">
                    Pre-vetted engineers, designers, and product managers who embed directly into
                    your team and work under your direction — hire within 48 hours, full IP
                    ownership, no long-term lock-in.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {["Frontend & Backend", "Full-stack", "Mobile", "AI/ML", "UI/UX", "QA", "DevOps", "Product"].map((r) => (
                      <span key={r} className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/70">{r}</span>
                    ))}
                  </div>
                  <span className="relative z-10 mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange transition-transform duration-300 group-hover:translate-x-0.5">
                    Hire staff
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </SpotlightCard>
              </Link>
            </Reveal>
            <Reveal delay={0.12}>
              <SpotlightCard className="h-full p-10 md:p-12">
                <Compass className="h-10 w-10 text-brand-blue" strokeWidth={1.5} />
                <h3 className="mt-8 font-display text-2xl md:text-3xl font-bold tracking-tight text-white">Technology Consulting</h3>
                <p className="mt-4 flex-1 leading-relaxed text-white/55">
                  Advisory work for founders, CTOs, and heads of product — architecture evaluation,
                  migration planning, vendor assessment, and technology roadmaps. Structured,
                  time-bound, and outcome-focused. We never bill indefinitely for advice.
                </p>
                <div className="mt-10">
                  <ArrowLink to="/contact-us" variant="blue">Book a consultation</ArrowLink>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="services-cta">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <SectionHead
            align="center"
            wrapperClassName="max-w-2xl"
            overline="Ready to start"
            title="Not sure which practice you need?"
            description="Tell us what you're building — we'll tell you honestly which team, model, or combination actually fits."
          />
          <div className="mt-8 flex justify-center">
            <ArrowLink to="/contact-us" variant="blue">Talk to our strategy team</ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
