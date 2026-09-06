"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Pause, Play,
  Rocket, RefreshCw, WifiOff, BellRing, BadgeCheck,
  LayoutDashboard, Smartphone, Building2, Boxes,
} from "lucide-react";
import { PageHero, Reveal, SectionHead, ArrowLink, EASE } from "@site/components/site/Reveal";
import { BentoGrid, BentoCard } from "@site/components/site/BentoGrid";
import SpotlightCard from "@site/components/site/SpotlightCard";
import PhoneBezel from "@site/components/site/PhoneBezel";

/*
 * Content sourced from OrynticLabs_Company_Document.pdf, "4. Mobile Development"
 * and the "Mobile Development" subsection of the Technology Stack chapter — the
 * capability list, stack descriptions, and delivery-model split below are pulled
 * directly from that document, not invented.
 *
 * The auto-rotating device carousel is adapted from 21st.dev's "Phone Mockups 1"
 * (solaceui) — an auto-advancing iPhone mockup with prev/next/pause controls —
 * reskinned onto the shared PhoneBezel chrome and driven by framer-motion
 * crossfades instead of that source's own animation approach.
 */

const CAPABILITIES = [
  {
    icon: Rocket,
    title: "Native performance",
    description: "React Native compiles to native UI components, not a web view. The performance and feel of the app is genuinely native — never a mobile-adapted web experience.",
    featured: true,
  },
  {
    icon: RefreshCw,
    title: "Cross-platform reach",
    description: "One codebase runs on both iOS and Android, cutting development time and cost without sacrificing quality.",
  },
  {
    icon: WifiOff,
    title: "Offline-first",
    description: "Keeps working when the network doesn't, and syncs the moment it's back.",
  },
  {
    icon: BellRing,
    title: "Push & real-time",
    description: "Notifications, live updates, and chat — wired in from day one, not bolted on later.",
  },
  {
    icon: BadgeCheck,
    title: "Store-ready",
    description: "App Store and Play Store submission handled as part of delivery, not an afterthought.",
  },
];

const STACK = [
  { letter: "R", name: "React Native", className: "bg-brand-blue text-white", text: "A framework for building native mobile applications using React. One codebase runs on both iOS and Android, significantly reducing development time and cost without sacrificing quality." },
  { letter: "E", name: "Expo", className: "bg-white text-black", text: "A platform and toolchain built on top of React Native. Simplifies development, testing, and deployment — managed builds, over-the-air updates, and native device APIs without writing native code." },
  { letter: "S", name: "Swift", className: "bg-brand-orange text-white", text: "Apple's native language for iOS and macOS. Used where performance, platform integration, or specific native APIs demand a fully native implementation." },
  { letter: "K", name: "Kotlin", className: "bg-violet-500 text-white", text: "The modern language for Android development, fully supported by Google. Used for native Android builds where requirements exceed what a cross-platform solution can offer." },
  { letter: "F", name: "Flutter", className: "bg-sky-500 text-white", text: "Google's UI toolkit for natively compiled apps across mobile, web, and desktop from a single Dart codebase. Used where pixel-perfect cross-platform UI consistency is the priority." },
];

const DELIVERY_MODELS = [
  { icon: Smartphone, title: "Consumer Applications", text: "Public-facing apps built for scale, retention, and a store-ready launch — from first release to ongoing versions." },
  { icon: Building2, title: "Enterprise Mobility", text: "Internal tools and field applications built for a defined workforce, with the access control and reliability that operations demand." },
  { icon: Boxes, title: "Hybrid Products", text: "Products that work seamlessly across web and mobile from one architecture, without compromising how either platform feels." },
];

const SCREENS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    render: () => (
      <div className="px-4 pt-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Today</p>
        <p className="mt-1 font-display text-lg font-bold text-white">Overview</p>
        <div className="mt-5 space-y-3">
          {[
            { label: "Active sessions", value: "1,204" },
            { label: "Sync status", value: "Up to date" },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[11px] text-white/45">{row.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "sync",
    label: "Offline Sync",
    icon: WifiOff,
    render: () => (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue">
          <WifiOff className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="mt-5 font-display text-base font-bold text-white">You're offline</p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/45">Changes are saved locally and will sync automatically once you're back online.</p>
      </div>
    ),
  },
  {
    key: "alerts",
    label: "Push Alerts",
    icon: BellRing,
    render: () => (
      <div className="space-y-3 px-4 pt-6">
        {["New message from Priya", "Deployment succeeded", "Weekly summary ready"].map((t, i) => (
          <div key={t} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-orange/15 text-brand-orange">
              <BellRing className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-white">{t}</p>
              <p className="mt-0.5 text-[11px] text-white/40">{i + 1}m ago</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "store",
    label: "Store Ready",
    icon: BadgeCheck,
    render: () => (
      <div className="space-y-3 px-4 pt-6">
        {["App Store — Approved", "Google Play — Live"].map((t) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <BadgeCheck className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="text-[12.5px] font-semibold text-white">{t}</p>
          </div>
        ))}
      </div>
    ),
  },
];

function PhoneCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const screen = SCREENS[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto flex flex-col items-center"
    >
      <PhoneBezel dotColor="bg-brand-orange">
        <div className="relative h-[calc(100%-52px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute inset-0"
            >
              {screen.render()}
            </motion.div>
          </AnimatePresence>
        </div>
      </PhoneBezel>

      <div className="mt-7 flex items-center gap-5" data-testid="mobile-dev-carousel-controls">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + SCREENS.length) % SCREENS.length)}
          aria-label="Previous screen"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/60 transition-colors duration-300 hover:border-brand-orange hover:text-brand-orange"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {SCREENS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setIndex(i)}
              aria-label={s.label}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-brand-orange" : "w-1.5 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play" : "Pause"}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/60 transition-colors duration-300 hover:border-brand-orange hover:text-brand-orange"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % SCREENS.length)}
          aria-label="Next screen"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/60 transition-colors duration-300 hover:border-brand-orange hover:text-brand-orange"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-white/35">
        <screen.icon className="h-3 w-3" strokeWidth={2} />
        {screen.label}
      </p>
    </div>
  );
}

export default function MobileDevelopmentClient() {
  return (
    <main data-testid="mobile-development-page">
      <PageHero
        overline="Mobile Development"
        lines={["BUILT FOR", "THE DEVICE.", "NOT THE BROWSER."]}
        accentIndex={1}
        description="Native and cross-platform mobile applications for iOS and Android — consumer apps, enterprise mobility, and hybrid products that work seamlessly across web and mobile. Every product we deliver is designed for the device first, never adapted from a web layout."
      />

      <section className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="mobile-dev-showcase">
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-[36rem] rounded-full bg-brand-orange/10 blur-[140px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Device-first, always</p>
            <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-white md:text-5xl">
              One app, built for how it's actually used.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
              React Native or fully native Swift/Kotlin when it matters — we choose per project,
              not by default. Every screen is designed for a phone in someone's hand, not a
              browser window resized down.
            </p>
            <div className="mt-9">
              <ArrowLink to="/contact-us">Start a mobile build</ArrowLink>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <PhoneCarousel />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="mobile-dev-capabilities">
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            overline="What's included"
            title="Five things every build ships with."
            description="Not optional add-ons — the baseline for anything OrynticLabs delivers on mobile."
          />
          <BentoGrid className="mt-14">
            {CAPABILITIES.map((c) => (
              <BentoCard
                key={c.title}
                title={c.title}
                description={c.description}
                href="/contact-us"
                cta="Talk to us"
                icon={c.icon}
                tint={c.featured ? "0,102,255" : "255,85,0"}
                featured={c.featured}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="mobile-dev-delivery-models">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Where it runs"
            title="Consumer, enterprise, or both at once."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {DELIVERY_MODELS.map((m, i) => (
              <Reveal key={m.title} delay={0.08 * i}>
                <div
                  data-testid={`mobile-dev-delivery-${i}`}
                  className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10"
                >
                  <m.icon className="h-9 w-9 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                  <h3 className="mt-7 font-display text-xl font-bold tracking-tight">{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="mobile-dev-stack">
        <div className="pointer-events-none absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-brand-blue/10 blur-[140px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            overline="The stack behind every build"
            title="We pick per project, not by default."
            description="Cross-platform when speed and shared reach win. Native when performance or platform depth demands it."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {STACK.map((s, i) => (
              <Reveal key={s.name} delay={0.06 * i}>
                <SpotlightCard tint={i % 2 === 0 ? "255,85,0" : "0,102,255"} className="p-7">
                  <div className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${s.className}`}>
                      {s.letter}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight text-white">{s.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="mobile-dev-cta">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <SectionHead
            align="center"
            wrapperClassName="max-w-2xl"
            overline="Ready when you are"
            title="Bring us the app you've been putting off."
            description="Tell us what it needs to do — we'll tell you honestly whether it should be native, cross-platform, or hybrid."
          />
          <div className="mt-8 flex justify-center">
            <ArrowLink to="/contact-us" variant="blue">Start a mobile project</ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
