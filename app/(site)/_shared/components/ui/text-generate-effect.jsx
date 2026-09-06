"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@site/lib/utils";

/**
 * Aceternity "text generate effect": words fade in from a blur, one at a
 * time, left to right — used for a single confident statement rather than
 * a whole paragraph of body copy.
 */
export function TextGenerateEffect({ words, className, filter = true, duration = 0.5 }) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: filter ? "blur(0px)" : "none" },
      { duration, delay: stagger(0.2) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.current]);

  return (
    <motion.div ref={scope} className={cn("font-bold", className)}>
      {wordsArray.map((word, i) => (
        <motion.span
          key={word + i}
          className="opacity-0"
          style={{ filter: filter ? "blur(10px)" : "none" }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.div>
  );
}
