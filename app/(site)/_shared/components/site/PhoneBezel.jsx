"use client";

import { Wifi } from "lucide-react";

/** Shared iPhone-style device chrome — status bar, dynamic island, bezel — so
 *  MobileAppSection and the mobile-development page don't each hand-roll their
 *  own device frame. Pass screen content as children; the frame stays fixed. */

export function SignalBars() {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {[4, 6, 8, 10].map((h, i) => (
        <span key={i} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />
      ))}
    </div>
  );
}

export function BatteryGlyph() {
  return (
    <span className="flex items-center" aria-hidden="true">
      <span className="relative flex h-[11px] w-[22px] items-center rounded-[3px] border border-white/70 p-[1.5px]">
        <span className="h-full w-[80%] rounded-[1px] bg-white" />
      </span>
      <span className="ml-[1.5px] h-[4px] w-[1.5px] rounded-r-sm bg-white/70" />
    </span>
  );
}

export default function PhoneBezel({ children, className = "", dotColor = "bg-brand-blue", fullBleed = false }) {
  return (
    <div
      className={`relative h-[560px] w-[280px] rounded-[2.75rem] border-[6px] border-neutral-800 bg-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95)] sm:h-[600px] sm:w-[300px] ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] bg-[#0b0b0e]">
        {!fullBleed && (
          <div className="relative flex items-center justify-between px-6 pt-4 text-[13px] font-semibold text-white">
            <span>9:41</span>
            <div className="absolute left-1/2 top-3 flex h-6 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5">
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${dotColor}`} />
            </div>
            <div className="flex items-center gap-1.5">
              <SignalBars />
              <Wifi className="h-3.5 w-3.5" strokeWidth={2.5} />
              <BatteryGlyph />
            </div>
          </div>
        )}
        {fullBleed ? <div className="h-full w-full">{children}</div> : children}
      </div>
    </div>
  );
}
