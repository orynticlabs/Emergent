"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { IMAGES } from "@site/data/content";
import { ArrowLink } from "@site/components/site/Reveal";
import { PointerHighlight } from "@site/components/ui/pointer-highlight";

/**
 * Aceternity "Text Generate Effect": each word fades in from a blur,
 * staggered left to right, instead of the whole headline appearing at once.
 * `render` items can be a plain word or a node (e.g. a PointerHighlight).
 */
function GeneratedHeadline({ words }) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate("span[data-word]", { opacity: 1, filter: "blur(0px)" }, { duration: 0.6, delay: stagger(0.09) });
  }, [animate]);

  return (
    <span ref={scope}>
      {words.map((word, i) => (
        <span key={i}>
          <span data-word className="inline-block" style={{ opacity: 0, filter: "blur(8px)" }}>
            {word.node ?? word}
          </span>
          {" "}
        </span>
      ))}
    </span>
  );
}

/** A slow, continuous light sweep across the description text. */
function ShineText({ children, className }) {
  return (
    <motion.p
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 1.6 }}
      style={{
        backgroundImage:
          "linear-gradient(110deg, rgba(255,255,255,0.55) 30%, #fff 50%, rgba(255,255,255,0.55) 70%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      className={className}
    >
      {children}
    </motion.p>
  );
}

const HEADLINE_WORDS = [
  "We", "Transform", "Your", "Ideas", "Into", { node: <br key="br" /> },
  "Software", "That", "People",
  {
    node: (
      <PointerHighlight key="love">
        <span className="text-brand-orange">Love.</span>
      </PointerHighlight>
    ),
  },
];

export default function AboutHero() {
  return (
    <section data-testid="page-hero" className="relative flex h-screen min-h-[640px] w-full items-center overflow-hidden bg-brand-ink">
      <img src={IMAGES.about} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-black" aria-hidden="true" />
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-blue/15 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-5xl px-6 text-center md:px-10">
        <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-7xl">
          <GeneratedHeadline words={HEADLINE_WORDS} />
        </h1>

        <div className="mx-auto mt-8 max-w-xl">
          <ShineText className="text-lg font-medium leading-relaxed md:text-xl">
            We design and build AI-powered software that businesses actually rely on — not demos,
            production systems people use every day.
          </ShineText>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
          className="mt-10 flex justify-center"
        >
          <ArrowLink to="/contact-us">Consult Our Experts</ArrowLink>
        </motion.div>
      </div>
    </section>
  );
}
