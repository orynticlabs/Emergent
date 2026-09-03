"use client";

import Marquee from "react-fast-marquee";
import { Asterisk } from "lucide-react";

export default function Ribbon({ items, dark = true, className = "" }) {
  return (
    <div
      data-testid="editorial-marquee"
      className={`overflow-hidden border-y py-8 md:py-10 ${
        dark ? "border-white/10 bg-brand-ink" : "border-black/10 bg-brand-paper"
      } ${className}`}
    >
      <Marquee speed={28} gradient={false} pauseOnHover>
        {items.map((item, i) => (
          <div key={i} className="mx-8 flex items-center gap-16 md:mx-12">
            <span
              className={`whitespace-nowrap font-display text-4xl md:text-6xl font-extrabold tracking-tight ${
                i % 2 === 0
                  ? dark ? "text-white" : "text-brand-coal"
                  : dark ? "text-outline-light" : "text-outline-dark"
              }`}
            >
              {item}
            </span>
            <Asterisk className="h-8 w-8 shrink-0 text-brand-orange md:h-10 md:w-10" strokeWidth={1.5} />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
