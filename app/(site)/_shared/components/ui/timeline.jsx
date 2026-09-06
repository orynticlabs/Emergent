"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Aceternity-style scroll-driven timeline: a gradient rail on the left fills
 * in as the reader scrolls past each entry, with the entry title pinned
 * alongside its content. Adapted for this site's always-dark theme (no
 * light/dark split) and brand colors.
 */
export function Timeline({ data }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full px-6 font-sans md:px-10" ref={containerRef}>
      <div ref={ref} className="relative mx-auto max-w-6xl pb-10">
        {data.map((item, index) => (
          <div key={item.title ?? index} className="flex justify-start gap-6 pt-16 md:gap-10 md:pt-24">
            <div className="sticky top-28 z-40 flex max-w-xs shrink-0 flex-col items-start self-start md:top-32 md:w-56">
              <div className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-brand-ink md:left-3">
                <div className="h-2.5 w-2.5 rounded-full bg-brand-orange shadow-[0_0_12px_2px_rgba(255,85,0,0.6)]" />
              </div>
              <h3 className="hidden pl-16 font-display text-2xl font-bold tracking-tight text-white/90 md:block md:pl-20 md:text-3xl">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-16 pr-2 md:pl-4">
              <h3 className="mb-4 block font-display text-xl font-bold tracking-tight text-white/90 md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute left-7 top-0 w-px overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-white/15 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-7"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-px rounded-full bg-gradient-to-t from-brand-orange via-brand-blue to-transparent from-[0%] via-[10%]"
          />
        </div>
      </div>
    </div>
  );
}
