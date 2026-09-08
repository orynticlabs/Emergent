"use client";

import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";

/**
 * Aceternity-style spotlight card: a radial glow that tracks the cursor, plus a gentle
 * perspective tilt toward the pointer, revealed on hover. Shared across WhatWeDo and any
 * other section that needs the same premium hover-card treatment - do not redefine locally.
 */
export default function SpotlightCard({ children, className = "", tint = "255,85,0", ...rest }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  const background = useMotionTemplate`radial-gradient(380px circle at calc(${mouseX} * 100%) calc(${mouseY} * 100%), rgba(${tint},0.16), transparent 72%)`;

  return (
    <motion.div
      {...rest}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-white/20 ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </motion.div>
  );
}
