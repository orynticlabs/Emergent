"use client";

import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { Reveal, ArrowLink, EASE } from "@site/components/site/Reveal";
import { TextScramble } from "@site/components/ui/text-scramble";
import PhoneBezel from "@site/components/site/PhoneBezel";

const ONBOARDING_SCREEN_1 = "/assets/on%20boarding.png";
const ONBOARDING_SCREEN_2 = "/assets/Onboarding.png";

/*
 * Phone-mockup treatment adapted from a 21st.dev "cinematic hero" component
 * (physical/skeuomorphic device card + mouse-tracked sheen + floating glass
 * badges + progress ring). Kept scoped to this one section instead of that
 * source's full-viewport GSAP ScrollTrigger pin-and-scrub timeline — pinning
 * the whole page for ~7000px of scroll around a single mid-page section would
 * break the surrounding homepage flow. Re-implemented the same visual language
 * with framer-motion (already the project's animation library) instead of
 * adding gsap as a new dependency.
 */

const MOBILE_STACK = [
  { name: "React Native", letter: "R", className: "bg-brand-blue text-white" },
  { name: "Expo", letter: "E", className: "bg-white text-black" },
  { name: "Swift", letter: "S", className: "bg-brand-orange text-white" },
  { name: "Kotlin", letter: "K", className: "bg-violet-500 text-white" },
  { name: "Flutter", letter: "F", className: "bg-sky-500 text-white" },
];

function FloatingBadge({ icon: Icon, title, subtitle, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
      className={`absolute z-30 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] md:flex ${className}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand-orange/30 bg-brand-orange/15 text-brand-orange">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="pr-1">
        <p className="text-xs font-bold tracking-tight text-white">{title}</p>
        <p className="text-[11px] font-medium text-white/45">{subtitle}</p>
      </div>
    </motion.div>
  );
}

/** Two overlapping device mockups, each showing one of the two onboarding-screen
 *  designs supplied as finished assets (public/assets/on boarding.png and
 *  Onboarding.png) — rendered full-bleed since both images already include
 *  their own status bar. */
function PhoneStack() {
  return (
    <div className="relative mx-auto h-[600px] w-[300px] sm:h-[660px] sm:w-[360px]">
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center" aria-hidden="true">
        <div className="h-72 w-72 rounded-full bg-brand-blue/10 blur-[110px]" />
      </div>

      <FloatingBadge icon={Flame} title="Native feel" subtitle="Not a wrapped web view" className="-left-4 top-4 lg:-left-12" />
      <FloatingBadge icon={Sparkles} title="Store ready" subtitle="Submission handled for you" className="-right-4 bottom-8 lg:-right-14" />

      {/* Back phone — Home screen */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: -18 }}
        whileInView={{ opacity: 1, x: 0, rotate: -8 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute left-0 top-0 origin-bottom-right scale-[0.8] sm:scale-90"
      >
        <PhoneBezel dotColor="bg-brand-blue" fullBleed>
          <img src={ONBOARDING_SCREEN_1} alt="OrynticLabs mobile app onboarding screen" className="h-full w-full object-cover" />
        </PhoneBezel>
      </motion.div>

      {/* Front phone — Detail screen */}
      <motion.div
        initial={{ opacity: 0, x: 30, rotate: 18 }}
        whileInView={{ opacity: 1, x: 0, rotate: 6 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className="absolute bottom-0 right-0 origin-top-left"
      >
        <PhoneBezel dotColor="bg-brand-orange" fullBleed>
          <img src={ONBOARDING_SCREEN_2} alt="OrynticLabs mobile app onboarding screen" className="h-full w-full object-cover" />
        </PhoneBezel>
      </motion.div>
    </div>
  );
}

function StoreButtons() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-black">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
        <span className="text-left leading-none">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Download on the</span>
          <span className="block text-sm font-bold tracking-tight">App Store</span>
        </span>
      </span>
      <span className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#18181b] px-4 py-2.5 text-white">
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true">
          <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
        </svg>
        <span className="text-left leading-none">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Get it on</span>
          <span className="block text-sm font-bold tracking-tight">Google Play</span>
        </span>
      </span>
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
          <h2 className="flex flex-wrap items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight text-white md:text-5xl">
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

          <StoreButtons />

          <div className="mt-8">
            <ArrowLink to="/services/mobile-development" variant="ghost" className="border-white/20 text-white hover:bg-white/5">
              Learn More
            </ArrowLink>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <PhoneStack />
        </Reveal>
      </div>
    </section>
  );
}
