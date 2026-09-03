"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Aceternity "animated tooltip": a row of overlapping avatars where hovering
 * one pops up a name/role card that tilts and slides slightly with the
 * cursor position across the avatar. Adapted to render an icon-in-a-circle
 * instead of a photo, since these represent roles, not named individuals.
 */
export function AnimatedTooltip({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  function handleMouseMove(event) {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  }

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className="group relative -mr-3"
            key={item.id}
            onMouseEnter={() => setHoveredIndex(item.id)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence mode="popLayout">
              {hoveredIndex === item.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 260, damping: 10 },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.6 }}
                  style={{ translateX, rotate, whiteSpace: "nowrap" }}
                  className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md border border-white/10 bg-[#0b0b0e] px-4 py-2 text-xs shadow-xl"
                >
                  <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-brand-orange to-transparent" />
                  <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-brand-blue to-transparent" />
                  <div className="relative z-30 text-sm font-bold text-white">{item.name}</div>
                  <div className="text-[11px] text-white/60">{item.designation}</div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              onMouseMove={handleMouseMove}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-ink object-cover object-top transition duration-500 group-hover:z-30 group-hover:scale-105 ${item.className ?? "bg-brand-orange"}`}
            >
              {Icon && <Icon className="h-5 w-5 text-white" strokeWidth={2} />}
            </div>
          </div>
        );
      })}
    </>
  );
}
