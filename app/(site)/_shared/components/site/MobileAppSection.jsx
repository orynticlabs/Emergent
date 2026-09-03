"use client";

import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { Reveal, ArrowLink } from "@site/components/site/Reveal";
import { TextScramble } from "@site/components/ui/text-scramble";

const MOBILE_STACK = [
  { name: "React Native", letter: "R", className: "bg-brand-blue text-white" },
  { name: "Expo", letter: "E", className: "bg-white text-black" },
  { name: "Swift", letter: "S", className: "bg-brand-orange text-white" },
  { name: "Kotlin", letter: "K", className: "bg-violet-500 text-white" },
  { name: "Flutter", letter: "F", className: "bg-sky-500 text-white" },
];

const APP_FEATURES = [
  { emoji: "🚀", title: "Native performance", desc: "React Native or fully native Swift/Kotlin when it matters — never a wrapped web view." },
  { emoji: "🔄", title: "Cross-platform reach", desc: "One codebase running on iOS and Android, without sacrificing how each platform feels." },
  { emoji: "📶", title: "Offline-first", desc: "Keeps working when the network doesn't, and syncs the moment it's back." },
  { emoji: "🔔", title: "Push & real-time", desc: "Notifications, live updates, and chat — wired in from day one, not bolted on later." },
  { emoji: "✅", title: "Store-ready", desc: "App Store and Play Store submission handled as part of delivery, not an afterthought." },
];

function SignalBars() {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {[4, 6, 8, 10].map((h, i) => (
        <span key={i} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />
      ))}
    </div>
  );
}

function BatteryGlyph() {
  return (
    <span className="flex items-center" aria-hidden="true">
      <span className="relative flex h-[11px] w-[22px] items-center rounded-[3px] border border-white/70 p-[1.5px]">
        <span className="h-full w-[80%] rounded-[1px] bg-white" />
      </span>
      <span className="ml-[1.5px] h-[4px] w-[1.5px] rounded-r-sm bg-white/70" />
    </span>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[560px] w-[280px] rounded-[2.75rem] border-[6px] border-neutral-800 bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] sm:h-[620px] sm:w-[300px]">
      <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] bg-[#0b0b0e]">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 text-[13px] font-semibold text-white">
          <span>9:41</span>
          <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="flex items-center gap-1.5">
            <SignalBars />
            <Wifi className="h-3.5 w-3.5" strokeWidth={2.5} />
            <BatteryGlyph />
          </div>
        </div>

        {/* Card list */}
        <div className="mt-6 space-y-3 px-4 pb-6">
          {APP_FEATURES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.15 * i, ease: "easeOut" }}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-[12px] leading-snug text-white/50">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MobileAppSection() {
  return (
    <section
      data-testid="home-mobile-app"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
        <Reveal>
          <h2 className="flex flex-wrap items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight text-white md:text-7xl">
            Built for <TextScramble text="iOS & Android" className="text-brand-orange" />
            <span className="relative inline-flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-blue" />
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
            Consumer apps, enterprise mobility, and hybrid products that work seamlessly across
            web and mobile — designed for the device first, never adapted from a web layout.
          </p>

          <div className="mt-10">
            <p className="text-sm text-white/45">The stack behind every build</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {MOBILE_STACK.map((tool) => (
                <div key={tool.name} className="flex items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${tool.className}`}
                  >
                    {tool.letter}
                  </span>
                  <span className="text-sm font-medium text-white/90">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <ArrowLink to="/services" variant="ghost" className="border-white/20 text-white hover:bg-white/5">
              Learn More
            </ArrowLink>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <PhoneMockup />
        </Reveal>
      </div>
    </section>
  );
}
