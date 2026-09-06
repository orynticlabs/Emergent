"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

const map = new DottedMap({ height: 100, grid: "diagonal" });

const SVG_MAP = map.getSVG({
  radius: 0.22,
  color: "#FFFFFF40",
  shape: "circle",
  backgroundColor: "transparent",
});

function projectPoint(lat, lng) {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
}

function createCurvedPath(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

export function WorldMap({ dots = [], lineColor = "#FF5500" }) {
  const svgRef = useRef(null);

  return (
    <div className="relative aspect-[2/1] w-full font-sans">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(SVG_MAP)}`}
        className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <svg ref={svgRef} viewBox="0 0 800 400" className="pointer-events-none absolute inset-0 h-full w-full select-none">
        <defs>
          <linearGradient id="world-map-path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <motion.path
              key={`path-${i}`}
              d={createCurvedPath(startPoint, endPoint)}
              fill="none"
              stroke="url(#world-map-path-gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.15 * i, ease: "easeOut" }}
            />
          );
        })}

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`points-${i}`}>
              <circle cx={startPoint.x} cy={startPoint.y} r="2.5" fill={lineColor} />
              <circle cx={startPoint.x} cy={startPoint.y} r="2.5" fill={lineColor} opacity="0.5">
                <animate attributeName="r" from="2.5" to="9" dur="1.6s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" begin="0s" repeatCount="indefinite" />
              </circle>
              <circle cx={endPoint.x} cy={endPoint.y} r="2.5" fill={lineColor} />
              <circle cx={endPoint.x} cy={endPoint.y} r="2.5" fill={lineColor} opacity="0.5">
                <animate attributeName="r" from="2.5" to="9" dur="1.6s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" begin="0s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
