"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EASE } from "@site/components/site/Reveal";

/**
 * Asymmetric bento grid - pattern adapted from Aceternity/Magic UI's Bento Grid
 * (21st.dev) and reskinned to the brand system: ink surfaces, orange/blue accent,
 * framer-motion stagger-in + a CTA row that lifts into view on hover instead of
 * the uniform equal-size cards `HoverEffect` produces. `featured` cards span 2
 * columns/rows on large screens so a handful of items read as highlights inside
 * an otherwise even grid - every item stays in the grid, nothing is dropped.
 */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

export function BentoGrid({ children, className = "" }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[15rem] lg:grid-flow-dense ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({ title, description, href, cta = "Learn more", icon: Icon, tint = "255,85,0", featured = false }) {
  return (
    <motion.div variants={cardVariants} className={featured ? "lg:col-span-2 lg:row-span-2" : ""}>
      <Link
        href={href}
        className="group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `rgba(${tint},0.35)` }}
          aria-hidden="true"
        />

        <div className="relative transform-gpu transition-transform duration-300 ease-out group-hover:-translate-y-2">
          {Icon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-brand-orange/40">
              <Icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
            </span>
          )}
          <h3 className={`font-display font-bold tracking-tight text-white ${featured ? "mt-6 text-xl" : "mt-5 text-base"}`}>
            {title}
          </h3>
          <p className={`mt-2.5 leading-relaxed text-white/55 ${featured ? "max-w-sm text-sm" : "text-sm"}`}>{description}</p>
        </div>

        <span className="relative inline-flex translate-y-3 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-orange opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {cta}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}
