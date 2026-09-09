"use client";

import { motion } from "framer-motion";
import { TECH_GROUPS, IMAGES } from "@site/data/content";
import { Reveal, SectionHead, ArrowLink, KineticLine, Magnetic, EASE } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";
import Ribbon from "@site/components/site/Ribbon";

function StackHero() {
  return (
    <section data-testid="page-hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white">
      <img src={IMAGES.tech} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
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
            Oryntic Labs - Technology Stack
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
          <KineticLine delay={0.15}>The Tools Behind</KineticLine>
          <KineticLine delay={0.27}>
            <CanvasText
              text="The Craft."
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
          We are technology-agnostic by principle. We choose the right tool for the problem - not the one that is trending or easiest to sell. Scalable, production-grade technologies chosen for longevity and performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ArrowLink to="#stack-grid">Explore the Stack</ArrowLink>
          </Magnetic>
          <Magnetic strength={12}>
            <ArrowLink to="/contact-us" variant="ghost" className="border-white/30 text-white backdrop-blur-md">
              Talk to an Engineer
            </ArrowLink>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

export default function StackClient() {
  return (
    <main data-testid="stack-page">
      <StackHero />

      <Ribbon items={["Next.js", "PyTorch", "Kubernetes", "PostgreSQL", "LangGraph", "React Native", "Kafka", "Terraform", "Figma"]} />

      <section id="stack-grid" className="bg-brand-ink py-24 text-white md:py-32" data-testid="stack-grid-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Full spectrum"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title={
              <>
                An honest picture of what we work with,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">and why it matters.</span>
              </>
            }
          />
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {TECH_GROUPS.map((group, i) => (
              <Reveal key={group.name} delay={0.04 * i} className="bg-brand-ink">
                <div
                  data-testid={`stack-group-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="group h-full p-8 transition-colors duration-300 hover:bg-white/[0.04] md:p-10"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-brand-blue">
                      {group.name}
                    </h3>
                    <span className="font-display text-xs font-bold text-white/25">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
                    {group.tools.map((tool, j) => (
                      <span key={tool} className="text-sm text-white/55 transition-colors duration-200 hover:text-brand-orange">
                        {tool}{j < group.tools.length - 1 && <span className="ml-3 text-white/20">/</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="hidden lg:block bg-brand-ink" aria-hidden="true" />
            <div className="hidden lg:block bg-brand-ink" aria-hidden="true" />
          </div>
          <Reveal delay={0.2}>
            <p className="mt-12 max-w-2xl text-sm leading-relaxed text-white/50">
              We work with new technologies as they mature and prove themselves in production. The stack
              above reflects what we use today - and it evolves as the landscape evolves. Working with a
              technology not listed here? Ask us. The answer is likely yes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="stack-cta">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Let's connect"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title={
              <>
                The right stack for your problem,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">starts with a conversation.</span>
              </>
            }
            description="Tell us what you're building - we'll recommend the optimal architecture, frameworks, and deployment strategy for your project."
          />
          <Reveal delay={0.2}>
            <div className="mt-10 flex justify-start">
              <ArrowLink to="/contact-us">Talk to an engineer</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
