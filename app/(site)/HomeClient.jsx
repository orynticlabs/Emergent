"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { IMAGES, HERO_VIDEO } from "@site/data/content";
import { KineticLine, ArrowLink, EASE, Magnetic } from "@site/components/site/Reveal";
import { Skeleton } from "@site/components/ui/skeleton";
import ClientMarquee from "@site/components/site/ClientMarquee";
import { CanvasText } from "@site/components/ui/canvas-text";

// Everything below the hero is code-split out of the initial bundle - each
// chunk downloads only once it's about to be needed, so first load only
// pays for the hero. A skeleton fills the section's place until then,
// instead of a layout jump when the real content arrives.
function SectionSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-10 h-[420px] w-full rounded-3xl" />
    </div>
  );
}

const dynamicSection = (loader) => dynamic(loader, { loading: SectionSkeleton });

const WhatWeDo = dynamicSection(() => import("@site/components/site/WhatWeDo"));
const IndustriesSection = dynamicSection(() => import("@site/components/site/IndustriesSection"));
const InternalProjectsSection = dynamicSection(() => import("@site/components/site/InternalProjectsSection"));
const MobileAppSection = dynamicSection(() => import("@site/components/site/MobileAppSection"));
const CaseStudiesSection = dynamicSection(() => import("@site/components/site/CaseStudiesSection"));
const LetsTalkSection = dynamicSection(() => import("@site/components/site/LetsTalkSection"));
const HeroParallaxSection = dynamicSection(() => import("@site/components/site/HeroParallaxSection"));

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }
  const cursorGlow = useMotionTemplate`radial-gradient(560px circle at ${mouseX}px ${mouseY}px, rgba(0,102,255,0.12), transparent 70%)`;

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      data-testid="home-hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        data-testid="hero-video"
        className="absolute inset-0 h-full w-full object-cover"
        poster={IMAGES.hero}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#050505]/65" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/30 to-[#050505]" aria-hidden="true" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
        style={{ background: cursorGlow }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-24 z-[1] h-72 w-72 rounded-full bg-brand-orange/20 blur-[110px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 z-[1] h-80 w-80 rounded-full bg-brand-blue/20 blur-[120px]"
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-36 pb-28 text-center md:px-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/60" data-testid="hero-overline">
            Oryntic Labs - Full-Spectrum Technology Company
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
          <KineticLine delay={0.15}>Engineering the Next Generation of</KineticLine>
          <KineticLine delay={0.27}>
            <CanvasText
              text="Intelligent Systems"
              className="font-display text-5xl font-black sm:text-6xl lg:text-7xl"
              colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
              lineGap={6}
              animationDuration={10}
            />
          </KineticLine>
          <KineticLine delay={0.39}>with AI<span className="text-brand-blue">.</span></KineticLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mx-auto mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-white/65"
        >
          We design, build, and deliver secure, scalable technology across the complete software
          lifecycle - combining strong architecture, data engineering, and AI capability to move
          organizations from strategy to reliable systems in production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ArrowLink to="/contact-us">Consult Our Strategy Team</ArrowLink>
          </Magnetic>
          <Magnetic strength={12}>
            <ArrowLink to="/services" variant="ghost" className="border-white/30 text-white backdrop-blur-md">Explore Services</ArrowLink>
          </Magnetic>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-6 rounded-full border border-white/40 p-1.5"
        >
          <div className="h-2 w-full rounded-full bg-brand-orange" />
        </motion.div>
      </div>
    </section>
  );
}

export default function HomeClient() {
  return (
    <main data-testid="home-page">
      <Hero />
      <ClientMarquee />
      <WhatWeDo />
      <IndustriesSection />
      <InternalProjectsSection />
      <MobileAppSection />
      <HeroParallaxSection />
      <CaseStudiesSection />
      <LetsTalkSection />
    </main>
  );
}
