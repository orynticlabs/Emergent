"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  HeartPulse,
  GraduationCap,
  Truck,
  Factory,
  Sprout,
  ShoppingBag,
  Zap,
  Building2,
  Car,
  UtensilsCrossed,
} from "lucide-react";
import { INDUSTRIES } from "@site/data/content";
import { Reveal, SectionHead, ArrowLink, EASE } from "@site/components/site/Reveal";

const ICONS = {
  Fintech: Landmark,
  "Healthcare & Biotech": HeartPulse,
  EdTech: GraduationCap,
  "Supply Chain & Logistics": Truck,
  Manufacturing: Factory,
  Agriculture: Sprout,
  "Retail & E-commerce": ShoppingBag,
  "Energy & Utilities": Zap,
  "Real Estate": Building2,
  Automobile: Car,
  "Hospitality & Food": UtensilsCrossed,
};

/*
 * Numbered hover-list + live preview panel - pattern adapted from 21st.dev's
 * "lumina-interactive-list" (a minimalist 01–06 vertical nav that updates a
 * featured preview on hover, built for "quiet luxury" showcases). Reskinned
 * to the brand system (ink/orange/blue) and driven by framer-motion instead
 * of that source's own animation approach; the preview shows the industry's
 * icon + copy rather than a photo, since we don't have per-industry imagery
 * and a mismatched stock photo would read as filler, not premium.
 */

function IndustryRow({ industry, index, active, onActivate }) {
  const Icon = ICONS[industry.name];
  const isActive = index === active;
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      data-testid={`industry-row-${index}`}
      aria-selected={isActive}
      role="option"
      className="group flex w-full items-center gap-5 border-b border-white/10 py-4 text-left"
    >
      <span
        className={`font-display text-sm font-bold tabular-nums transition-colors duration-300 ${
          isActive ? "text-brand-orange" : "text-white/25"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={`flex-1 font-display text-lg font-bold tracking-tight transition-colors duration-300 sm:text-xl ${
          isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
        }`}
      >
        {industry.name}
      </span>
      <motion.span
        whileHover={{ rotate: 14, scale: 1.15 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`inline-flex shrink-0 transition-all duration-300 ${
          isActive ? "translate-x-0 text-brand-orange opacity-100" : "-translate-x-1 text-white/20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </motion.span>
    </button>
  );
}

export default function IndustriesSection() {
  const [active, setActive] = useState(0);
  const industry = INDUSTRIES[active];
  const Icon = ICONS[industry.name];
  const tint = active % 2 === 0 ? "255,85,0" : "0,102,255";

  return (
    <section
      data-testid="home-industries"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-[36rem] rounded-full bg-brand-blue/10 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <SectionHead
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-4xl"
            title={
              <>
                Eleven industries.
                <br className="hidden sm:block" />
                <span className="text-brand-orange">Zero copy-paste solutions.</span>
              </>
            }
            description="We spend time understanding how an industry actually operates before we propose anything - that's why what we build for a hospital looks nothing like what we build for a warehouse."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div role="listbox" aria-label="Industries we serve" className="border-t border-white/10">
              {INDUSTRIES.map((ind, i) => (
                <IndustryRow key={ind.name} industry={ind} index={i} active={active} onActivate={() => setActive(i)} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="relative h-full min-h-[32rem] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-10 sm:p-12">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-[100px] transition-colors duration-500"
                style={{ background: `rgba(${tint},0.16)` }}
                aria-hidden="true"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={industry.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative flex h-full flex-col"
                  data-testid="industry-preview"
                >
                  <motion.span
                    initial={{ scale: 0.4, rotate: -110, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    whileHover={{ rotate: 12, scale: 1.08 }}
                    className="grid h-16 w-16 cursor-default place-items-center rounded-2xl border border-white/10"
                    style={{ background: `rgba(${tint},0.14)` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: `rgb(${tint})` }} strokeWidth={1.5} />
                  </motion.span>
                  <h3 className="mt-8 font-display text-3xl font-black tracking-tight sm:text-4xl">{industry.name}</h3>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55">{industry.build}</p>

                  {industry.approach && (
                    <p className="mt-4 max-w-lg border-l-2 pl-4 text-sm leading-relaxed text-white/45" style={{ borderColor: `rgb(${tint})` }}>
                      {industry.approach}
                    </p>
                  )}

                  {industry.capabilities?.length > 0 && (
                    <div className="mt-6 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">What we build</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {industry.capabilities.map((cap) => (
                          <span
                            key={cap}
                            data-testid="industry-capability-tag"
                            className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/70"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <ArrowLink to="/industries">Explore this industry</ArrowLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
