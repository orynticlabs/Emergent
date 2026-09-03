"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@site/lib/utils";

/**
 * Aceternity "card hover effect": a soft highlight block slides between
 * cards on hover via a single shared layoutId, instead of each card
 * animating its own background independently.
 */
export function HoverEffect({ items, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={item.title}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-2xl bg-white/[0.06]"
                layoutId="industry-hover-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
              />
            )}
          </AnimatePresence>
          <Card>
            {item.icon && (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-brand-orange/40">
                <item.icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
              </span>
            )}
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "relative z-20 h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 group-hover:border-white/20",
        className,
      )}
    >
      <div className="relative z-50 flex h-full flex-col">{children}</div>
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h4 className={cn("mt-5 font-display text-base font-bold tracking-tight text-white", className)}>
      {children}
    </h4>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={cn("mt-2 flex-1 text-sm leading-relaxed text-white/55", className)}>{children}</p>
  );
}
