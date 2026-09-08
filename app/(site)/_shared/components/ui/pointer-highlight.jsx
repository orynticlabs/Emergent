"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@site/lib/utils";

/**
 * Aceternity "PointerHighlight": once the wrapped word scrolls into view, a
 * rectangle draws around it and fades, then a small cursor/pointer icon
 * appears at its corner and fades in - reads like a design-tool annotation
 * rather than a static highlight box.
 */
export function PointerHighlight({ children, rectangleClassName, pointerClassName, containerClassName }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={containerRef} className={cn("relative inline-block w-fit", containerClassName)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.5 }}>
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 1, ease: "easeOut" }}
              className={cn("pointer-events-none absolute -inset-x-1 -inset-y-0.5 rounded-md border-2 border-brand-orange", rectangleClassName)}
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className={cn("pointer-events-none absolute -right-4 -top-4", pointerClassName)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="-rotate-[70deg] text-brand-orange">
                <path
                  d="M12.75 3.75L3.75 8.25L10.5 10.5L12.75 17.25L17.25 8.25L12.75 3.75Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
