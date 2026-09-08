"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@site/lib/utils";

/**
 * Aceternity "Apple cards carousel": a horizontally-scrolling row of image
 * cards that expand into a full detail overlay on click. Scroll arrows are
 * exposed separately (via useCarouselControls) so the caller can place them
 * wherever it wants - here, top-right next to the section heading instead
 * of below the row like the original demo.
 */

const CarouselContext = createContext({ onCardClose: () => {}, currentIndex: 0 });

function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handler(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      callback(event);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, callback]);
}

export function useCarouselControls() {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
  }, []);

  const scrollLeft = () => trackRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  const scrollRight = () => trackRef.current?.scrollBy({ left: 360, behavior: "smooth" });

  return { trackRef, canScrollLeft, canScrollRight, checkScrollability, scrollLeft, scrollRight };
}

export function CarouselArrows({ canScrollLeft, canScrollRight, scrollLeft, scrollRight, className = "" }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-300 hover:border-brand-orange/50 disabled:opacity-30"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollRight}
        disabled={!canScrollRight}
        aria-label="Scroll right"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-300 hover:border-brand-orange/50 disabled:opacity-30"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Carousel({ items, trackRef, onScroll, currentIndex, onCardClose }) {
  return (
    <CarouselContext.Provider value={{ onCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex w-full gap-4 overflow-x-scroll overscroll-x-contain scroll-smooth py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06 * index, ease: "easeOut" }}
              key={item.key ?? index}
              className={cn("shrink-0", index === items.length - 1 && "pr-4")}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export function Card({ card, index }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") handleClose();
    }
    document.body.style.overflow = open ? "hidden" : "";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  function handleClose() {
    setOpen(false);
    onCardClose?.(index);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/85 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              ref={containerRef}
              className="relative z-[110] mx-auto my-10 h-fit max-w-4xl rounded-3xl border border-white/10 bg-[#0b0b0e] p-4 font-sans md:p-10"
            >
              <button
                onClick={handleClose}
                aria-label="Close"
                className="sticky right-0 top-4 ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="mt-2 text-sm font-bold uppercase tracking-widest text-brand-orange">{card.category}</p>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">{card.title}</p>
              <div className="pt-8">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(true)}
        data-testid={`case-study-card-${index}`}
        className="relative flex h-80 w-64 flex-col items-start justify-start overflow-hidden rounded-3xl bg-neutral-900 md:h-[28rem] md:w-80"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="relative z-40 p-6 text-left">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-white/70">{card.category}</p>
          <p className="mt-2 max-w-[14rem] text-left font-display text-xl font-bold text-balance text-white md:text-2xl">
            {card.title}
          </p>
        </div>
        <img src={card.src} alt={card.title} loading="lazy" decoding="async" className="absolute inset-0 z-10 h-full w-full object-cover" />
      </button>
    </>
  );
}
