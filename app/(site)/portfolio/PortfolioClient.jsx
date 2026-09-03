"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { IMAGES, PROJECTS } from "@site/data/content";
import { Reveal, ArrowLink, EASE } from "@site/components/site/Reveal";

const HERO_STATS = [
  { type: "image", image: IMAGES.culture, badge: "Engineering Studio" },
  { type: "stat", value: "08", label: "Service Practices", accent: "text-brand-orange" },
  { type: "stat", value: "03", label: "Proprietary Products", accent: "text-brand-blue" },
  { type: "stat", value: "11", label: "Industries Served", accent: "text-brand-orange" },
  { type: "image", image: IMAGES.hero, badge: "Full-Spectrum Delivery" },
];

const CATEGORIES = ["All", "AI Solutions", "Web Platforms", "Mobile Apps", "Enterprise Software"];

function HeroStat({ stat, index }) {
  if (stat.type === "image") {
    return (
      <Reveal delay={0.08 * index}>
        <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 md:h-52">
          <img src={stat.image} alt={stat.badge} className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-brand-ink/80 px-3.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
            {stat.badge}
          </span>
        </div>
      </Reveal>
    );
  }
  return (
    <Reveal delay={0.08 * index}>
      <div className="flex h-44 flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:h-52">
        <p className={`font-display text-4xl font-black tracking-tight md:text-5xl ${stat.accent}`}>{stat.value}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-widest text-white/55">{stat.label}</p>
      </div>
    </Reveal>
  );
}

export default function PortfolioClient() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = PROJECTS.filter((p) => {
    const matchCategory = category === "All" || p.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || [p.title, p.desc, p.industry, ...p.tags].join(" ").toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  return (
    <main data-testid="portfolio-page">
      <section className="bg-mesh-brand relative overflow-hidden pb-20 pt-40 text-white md:pt-48">
        <div className="relative mx-auto max-w-7xl px-6 text-center md:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">Portfolio</p>
          </Reveal>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.08]">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.15, ease: EASE }}>
                Digital Products Engineered for
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block font-semibold text-brand-orange" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.27, ease: EASE }}>
                Ambitious Businesses.
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg"
          >
            Explore how OrynticLabs engineers digital solutions across 11 industries —
            from AI platforms to enterprise systems.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
            className="mt-9"
          >
            <ArrowLink to="/contact-us">Book a Portfolio Walkthrough</ArrowLink>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {HERO_STATS.map((stat, i) => (
              <HeroStat key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-16 text-white md:py-20" data-testid="portfolio-grid-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2.5" data-testid="portfolio-filters">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  data-testid={`portfolio-filter-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    category === cat
                      ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                      : "border border-white/15 text-white/60 hover:border-brand-blue/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                data-testid="portfolio-search"
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-12 pr-5 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur-sm transition-colors duration-300 focus:border-brand-orange"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  layout
                  key={p.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, delay: 0.04 * i, ease: EASE }}
                  data-testid={`project-card-${i}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-orange/50 hover:shadow-[0_30px_70px_-30px_rgba(255,85,0,0.35)]"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full bg-brand-ink/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-orange backdrop-blur-md">
                      {p.category}
                    </span>
                    <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                      {p.industry}
                    </span>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-brand-orange">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/50">{p.desc}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 px-3.5 py-1 text-[11px] font-medium text-white/55">
                          {t}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="/contact-us"
                      className="group/link mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-blue transition-colors duration-300 hover:text-brand-orange"
                    >
                      Discuss a similar project
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center" data-testid="portfolio-empty">
              <p className="font-display text-xl font-bold">No projects match your search.</p>
              <p className="mt-2 text-sm text-white/45">Try a different keyword or category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-mesh-brand relative overflow-hidden border-t border-white/10 py-24 text-white md:py-28" data-testid="portfolio-cta">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 md:flex-row md:items-end md:px-10">
          <Reveal>
            <h2 className="max-w-2xl font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
              Have a product to build? <span className="text-brand-orange">Let's make it real.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <ArrowLink to="/contact-us">Start the conversation</ArrowLink>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
