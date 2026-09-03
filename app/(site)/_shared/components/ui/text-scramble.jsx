"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Decrypt/scramble-in text effect: characters cycle randomly, then lock into the real text left to right, once it scrolls into view. */
export function TextScramble({ text, className = "", duration = 900 }) {
  const [display, setDisplay] = useState(text);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 30);
    const interval = setInterval(() => {
      frame++;
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealCount) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [inView, text, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
