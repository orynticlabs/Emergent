"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTestimonials } from "@site/hooks/use-testimonials";
import { SectionHead } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";

/*
 * Aceternity "AnimatedTestimonials": a stacked, depth-rotated card for the
 * active speaker with prev/next controls, and the quote text blurring in
 * word by word — pattern close to 21st.dev's "Profile Card Testimonial
 * Carousel" (avatar photo + fade transitions + bottom nav); literal source
 * wasn't pulled, this is built from the pattern, not copied code. Content
 * (name, role, quote, photo) is managed in OryCMS under
 * Feature -> Testimonials, not hardcoded here.
 */

// Deterministic per-card tilt — must render identically on server and
// client, so this can't use Math.random() (which caused a hydration
// mismatch: server and client each rolled a different rotation value).
function tiltFor(index) {
  return ((index * 5) % 14) - 7;
}

export default function AboutTestimonials() {
  const { testimonials: voices } = useTestimonials();
  const [active, setActive] = useState(0);

  const handleNext = () => setActive((prev) => (prev + 1) % voices.length);
  const handlePrev = () => setActive((prev) => (prev - 1 + voices.length) % voices.length);
  const isActive = (index) => index === active;

  useEffect(() => {
    if (voices.length === 0) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices.length]);

  if (voices.length === 0) return null;

  const safeActive = active % voices.length;

  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-testimonials">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          align="center"
          titleClassName="text-2xl md:text-7xl uppercase"
          wrapperClassName="mx-auto max-w-4xl"
          title={
            <>
              How the studio
              <br />
              <CanvasText
                text="actually works"
                className="font-display text-2xl font-black uppercase md:text-7xl"
                colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
                lineGap={6}
                animationDuration={10}
              />
            </>
          }
          description="Not client quotes — this is how our own team describes the way we build, in their own words."
        />

        <div className="relative mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-16 md:grid-cols-2">
          <div className="relative h-72 w-full md:h-80">
            <AnimatePresence>
              {voices.map((v, index) => (
                isActive(index) || index === (safeActive + 1) % voices.length || index === (safeActive + 2) % voices.length ? (
                  <motion.div
                    key={v.id ?? v.name + index}
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
                    className="absolute inset-0 origin-bottom overflow-hidden rounded-3xl border border-white/10"
                  >
                    {v.image ? (
                      <img src={v.image} alt={v.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-white/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
                  </motion.div>
                ) : null
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between py-4">
            <motion.div key={safeActive} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
              <h3 className="font-display text-2xl font-bold text-white">{voices[safeActive].name}</h3>
              <p className="text-sm text-white/40">{voices[safeActive].role}</p>
              <p className="mt-8 text-lg leading-relaxed text-white/70">
                {voices[safeActive].quote.split(" ").map((word, i) => (
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
