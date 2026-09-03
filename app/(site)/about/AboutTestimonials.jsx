"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Code2, Layers, BrainCircuit, PenTool, Cloud, Headphones, Rocket, ShieldCheck } from "lucide-react";
import { SectionHead } from "@site/components/site/Reveal";

/**
 * Aceternity "AnimatedTestimonials": a stacked, depth-rotated card for the
 * active speaker with prev/next controls, and the quote text blurring in
 * word by word. The stacked "photo" slot here is a role icon badge, not a
 * stock photo of a person — these are internal voices, not client quotes.
 */
const VOICES = [
  { name: "Engineering", role: "How we scope work", quote: "We scope everything before writing a line of code — no surprises three months in.", icon: Code2, className: "from-brand-orange to-[#ff8a3d]" },
  { name: "Product", role: "How we ship", quote: "Every sprint ends in a working demo, not a status update.", icon: Layers, className: "from-brand-blue to-sky-400" },
  { name: "AI & ML", role: "How we deploy models", quote: "AI in production means monitoring and fallback plans — not just a clever prompt.", icon: BrainCircuit, className: "from-violet-500 to-fuchsia-500" },
  { name: "Product Design", role: "How we design", quote: "Design isn't decoration here — it's the reason people actually use what we build.", icon: PenTool, className: "from-pink-500 to-rose-400" },
  { name: "Cloud & DevOps", role: "How we deploy", quote: "We deploy to real infrastructure from day one, not a staging environment that never ships.", icon: Cloud, className: "from-sky-500 to-brand-blue" },
  { name: "Support", role: "How we handle issues", quote: "Support tickets get read by the people who wrote the code.", icon: Headphones, className: "from-emerald-500 to-teal-400" },
  { name: "Leadership", role: "How we stay involved", quote: "Founders sit in on kickoff calls. That doesn't change once the contract is signed.", icon: Rocket, className: "from-brand-orange to-[#ff8a3d]" },
  { name: "Security", role: "How we handle client data", quote: "Client data is isolated by design, not by promise — access is scoped and logged.", icon: ShieldCheck, className: "from-brand-blue to-cyan-400" },
];

// Deterministic per-card tilt — must render identically on server and
// client, so this can't use Math.random() (which caused a hydration
// mismatch: server and client each rolled a different rotation value).
function tiltFor(index) {
  return ((index * 5) % 14) - 7;
}

export default function AboutTestimonials() {
  const [active, setActive] = useState(0);

  const handleNext = () => setActive((prev) => (prev + 1) % VOICES.length);
  const handlePrev = () => setActive((prev) => (prev - 1 + VOICES.length) % VOICES.length);
  const isActive = (index) => index === active;

  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-testimonials">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          align="center"
          titleClassName="text-2xl md:text-7xl uppercase"
          wrapperClassName="mx-auto max-w-4xl"
          title="How the studio actually works"
          description="Not client quotes — this is how our own team describes the way we build, in their own words."
        />

        <div className="relative mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-16 md:grid-cols-2">
          <div className="relative h-72 w-full md:h-80">
            <AnimatePresence>
              {VOICES.map((v, index) => {
                const Icon = v.icon;
                return (
                  isActive(index) || index === (active + 1) % VOICES.length || index === (active + 2) % VOICES.length ? (
                    <motion.div
                      key={v.name + index}
                      initial={{ opacity: 0, scale: 0.9, rotate: tiltFor(index) }}
                      animate={{
                        opacity: isActive(index) ? 1 : 0.6,
                        scale: isActive(index) ? 1 : 0.94,
                        rotate: isActive(index) ? 0 : tiltFor(index),
                        zIndex: isActive(index) ? 40 : 10,
                        y: isActive(index) ? [0, -18, 0] : 0,
                      }}
                      exit={{ opacity: 0, scale: 0.9, rotate: tiltFor(index) }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0 origin-bottom"
                    >
                      <div className={`flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br ${v.className}`}>
                        <Icon className="h-20 w-20 text-white/90" strokeWidth={1.25} />
                      </div>
                    </motion.div>
                  ) : null
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between py-4">
            <motion.div key={active} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
              <h3 className="font-display text-2xl font-bold text-white">{VOICES[active].name}</h3>
              <p className="text-sm text-white/40">{VOICES[active].role}</p>
              <p className="mt-8 text-lg leading-relaxed text-white/70">
                {VOICES[active].quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ filter: "blur(8px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut", delay: 0.02 * i }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </p>
            </motion.div>

            <div className="flex gap-4 pt-12 md:pt-0">
              <button
                onClick={handlePrev}
                aria-label="Previous"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors duration-300 hover:border-brand-orange"
              >
                <ArrowLeft className="h-4 w-4 text-white/70 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-brand-orange" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors duration-300 hover:border-brand-orange"
              >
                <ArrowRight className="h-4 w-4 text-white/70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand-orange" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
