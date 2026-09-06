"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@site/lib/utils";

/**
 * Aceternity "LayoutGrid": a bento image grid where clicking a card expands
 * it into a centered overlay showing its full caption, using a shared
 * layoutId so the image itself morphs in place rather than swapping.
 */
export function LayoutGrid({ cards }) {
  const [selected, setSelected] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);

  const handleClick = (card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="relative mx-auto grid h-full w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.id} className={card.className}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              "relative h-full w-full overflow-hidden",
              selected?.id === card.id
                ? "absolute inset-0 z-50 m-auto h-1/2 w-full flex-wrap flex-col items-center justify-center rounded-2xl md:w-1/2"
                : lastSelected?.id === card.id
                  ? "z-40 h-full w-full rounded-2xl bg-white/5"
                  : "h-full w-full rounded-2xl bg-white/5"
            )}
            layoutId={`gallery-card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <motion.img
              layoutId={`gallery-image-${card.id}`}
              src={card.thumbnail}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top transition duration-200"
            />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute left-0 top-0 z-10 h-full w-full bg-black",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.6 : 0 }}
      />
    </div>
  );
}

function SelectedCard({ selected }) {
  return (
    <div className="relative z-[60] flex h-full w-full flex-col justify-end rounded-2xl shadow-2xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        className="absolute inset-0 z-10 h-full w-full bg-black"
      />
      <motion.div
        layout
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-[70] px-6 pb-6 pt-4"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
}
