"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useInView, animate } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const EASE = [0.16, 1, 0.3, 1];

/** Pulls the pointer's translation toward its center within `strength` px — used on CTAs and pill buttons for a tactile, premium feel. Disabled on touch devices. */
export const Magnetic = ({ children, strength = 18, className = "" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.2 });

  function handleMouseMove(event) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set((relX / (rect.width / 2)) * strength);
    y.set((relY / (rect.height / 2)) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

/** Animates a stat's leading number from 0 to its value once scrolled into view, preserving any prefix/suffix (%, +, leading zeros). */
export const CountUp = ({ value, duration = 1.4, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(String(value).replace(/\d/g, "0"));
  const match = String(value).match(/(\d+)/);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseInt(match[1], 10);
    const [prefix, suffix] = [String(value).slice(0, match.index), String(value).slice(match.index + match[1].length)];
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (latest) => {
        const digits = Math.round(latest).toString().padStart(match[1].length, "0");
        setDisplay(`${prefix}${digits}${suffix}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};

export const Reveal = ({ children, delay = 0, y = 28, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

export const KineticLine = ({ children, delay = 0, className = "" }) => (
  <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
    <motion.span
      className="block will-change-transform"
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

export const Overline = ({ children, color = "orange", className = "" }) => (
  <p
    className={`text-xs font-bold tracking-[0.3em] uppercase ${
      color === "orange" ? "text-brand-orange" : "text-brand-blue"
    } ${className}`}
  >
    {children}
  </p>
);

export const PageHero = ({ overline, lines = [], accentIndex = 1, description, dark = true }) => (
  <section
    data-testid="page-hero"
    className={`relative overflow-hidden pt-40 pb-24 md:pt-52 md:pb-32 ${
      dark ? "bg-brand-ink text-white bg-grid-dark" : "bg-brand-paper text-brand-coal bg-grid-light"
    }`}
  >
    {dark && (
      <>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-blue/20 blur-[120px]" aria-hidden="true" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-brand-orange/15 blur-[120px]" aria-hidden="true" />
      </>
    )}
    <div className="relative mx-auto max-w-7xl px-6 md:px-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Overline color={dark ? "orange" : "blue"}>{overline}</Overline>
      </motion.div>
      <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
        {lines.map((line, i) => (
          <KineticLine key={i} delay={0.15 + i * 0.12}>
            <span className={i === accentIndex ? "text-brand-orange" : ""}>{line}</span>
          </KineticLine>
        ))}
      </h1>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 + lines.length * 0.12, ease: EASE }}
          className={`mt-8 max-w-2xl text-base md:text-lg leading-relaxed ${
            dark ? "text-white/60" : "text-black/60"
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  </section>
);

export const SectionHead = ({
  overline,
  title,
  description,
  dark = true,
  align = "left",
  titleClassName = "text-4xl md:text-5xl",
  wrapperClassName = "max-w-3xl",
}) => (
  <div className={`${wrapperClassName} ${align === "center" ? "mx-auto text-center" : ""}`} data-testid="section-head">
    {overline && (
      <Reveal>
        <Overline color={dark ? "orange" : "blue"}>{overline}</Overline>
      </Reveal>
    )}
    <Reveal delay={0.1}>
      <h2 className={`font-display font-bold tracking-tight leading-[1.08] ${overline ? "mt-4" : ""} ${titleClassName}`}>
        {title}
      </h2>
    </Reveal>
    {description && (
      <Reveal delay={0.2}>
        <p className={`mt-5 text-base md:text-lg leading-relaxed ${dark ? "text-white/60" : "text-black/60"}`}>
          {description}
        </p>
      </Reveal>
    )}
  </div>
);

export const ArrowLink = ({ to, children, variant = "primary", className = "" }) => {
  const styles =
    variant === "primary"
      ? "bg-brand-orange text-white hover:bg-[#e04a00]"
      : variant === "blue"
        ? "bg-brand-blue text-white hover:bg-[#0052cc]"
        : "border border-current hover:bg-white/10";
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
      <Link
        href={to}
        data-testid={`cta-${String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 ${styles} ${className}`}
      >
        {children}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </motion.div>
  );
};
