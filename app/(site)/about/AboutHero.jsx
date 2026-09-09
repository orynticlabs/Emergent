"use client";

import { motion } from "framer-motion";
import { IMAGES } from "@site/data/content";
import { KineticLine, ArrowLink, EASE, Magnetic } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";

export default function AboutHero() {
  return (
    <section data-testid="page-hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white">
      <img src={IMAGES.about} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
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
            Oryntic Labs - Who We Are
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
          <KineticLine delay={0.15}>We Transform Ideas Into</KineticLine>
          <KineticLine delay={0.27}>
            <CanvasText
              text="Software People Love."
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
          We design and build AI-powered software that businesses actually rely on - not demos or
          prototypes, but production systems people use every day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ArrowLink to="/contact-us">Consult Our Experts</ArrowLink>
          </Magnetic>
          <Magnetic strength={12}>
            <ArrowLink to="#about-who-we-are" variant="ghost" className="border-white/30 text-white backdrop-blur-md">
              Who We Are
            </ArrowLink>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
