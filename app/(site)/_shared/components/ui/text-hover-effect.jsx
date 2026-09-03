"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Aceternity "text-hover-effect": a large outlined SVG wordmark whose fill is
 * revealed through a cursor-following radial mask, painted with a brand
 * gradient. Off cursor, only a faint stroke outline of the text is visible.
 */
export function TextHoverEffect({ text, duration }) {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1200 200"
      xmlns="http://www.w3.org/2000/svg"
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="select-none"
    >
      <defs>
        <linearGradient id="oryTextGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#FF5500" />
              <stop offset="35%" stopColor="#ff8a3d" />
              <stop offset="65%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#38bdf8" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="oryRevealMask"
          gradientUnits="userSpaceOnUse"
          r="22%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="oryTextMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#oryRevealMask)" />
        </mask>
      </defs>

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        textLength="1160"
        lengthAdjust="spacingAndGlyphs"
        strokeWidth="0.4"
        className="fill-transparent stroke-white/15 font-display font-black"
        style={{ opacity: hovered ? 0.6 : 0, fontSize: 260 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        textLength="1160"
        lengthAdjust="spacingAndGlyphs"
        strokeWidth="0.4"
        className="fill-transparent stroke-white/10 font-display font-black"
        style={{ fontSize: 260 }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        textLength="1160"
        lengthAdjust="spacingAndGlyphs"
        stroke="url(#oryTextGradient)"
        strokeWidth="0.4"
        mask="url(#oryTextMask)"
        className="fill-transparent font-display font-black"
        style={{ fontSize: 260 }}
      >
        {text}
      </text>
    </svg>
  );
}
