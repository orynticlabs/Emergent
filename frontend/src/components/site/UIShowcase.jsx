import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Globe, LayoutDashboard, Palette, TrendingUp } from "lucide-react";
import { IMAGES } from "@/data/content";
import { Reveal, Overline, EASE } from "@/components/site/Reveal";

const FEATURES = [
  {
    icon: Globe,
    title: "Marketing sites that convert",
    text: "High-impact landing pages and brand sites — kinetic typography, purposeful motion, and performance budgets that keep bounce rates low.",
  },
  {
    icon: LayoutDashboard,
    title: "Data-dense dashboards",
    text: "Admin panels and analytics interfaces that stay readable at scale — clear hierarchy, real-time data states, and interactions operators love.",
  },
  {
    icon: Palette,
    title: "Design systems that scale",
    text: "Token-driven component libraries in Figma and code — so every screen your team ships next year still looks like one product.",
  },
];

const BARS = [38, 62, 48, 78, 58, 92, 70];

const GALLERY = [
  { title: "Analytics Command Dashboard", category: "Dashboard", desc: "Real-time operations view with live charts, alerts, and drill-downs.", image: IMAGES.dashboard },
  { title: "AI Intelligence Console", category: "Dashboard", desc: "Agent monitoring, evaluation scores, and knowledge coverage at a glance.", image: IMAGES.ai },
  { title: "Enterprise Web Platform", category: "Website", desc: "Multi-role portal with structured content and workflow automation.", image: IMAGES.architecture },
  { title: "Brand Marketing Site", category: "Website", desc: "Kinetic storytelling pages engineered for speed and conversion.", image: IMAGES.hero },
  { title: "Team Workspace Portal", category: "Website", desc: "Internal tools hub with documents, meetings, and people operations.", image: IMAGES.culture },
  { title: "Infrastructure Monitor", category: "Dashboard", desc: "Uptime, latency, and deployment pipelines in one dark-ops view.", image: IMAGES.datacenter },
  { title: "Mobile Companion App", category: "Mobile", desc: "Native-feel companion experiences for iOS and Android.", image: IMAGES.about },
];

function Gallery() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = GALLERY[index];

  const go = (next, direction) => {
    setDir(direction);
    setIndex((next + GALLERY.length) % GALLERY.length);
  };

  return (
    <div className="mt-24" data-testid="ui-gallery">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Overline color="blue">Design Gallery</Overline>
            <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight">
              Flip through the <span className="text-brand-orange">craft.</span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(index - 1, -1)}
              data-testid="gallery-prev"
              aria-label="Previous design"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-brand-orange hover:text-brand-orange"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[3.5rem] text-center font-display text-sm font-bold text-white/50" data-testid="gallery-counter">
              {String(index + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")}
            </span>
            <button
              onClick={() => go(index + 1, 1)}
              data-testid="gallery-next"
              aria-label="Next design"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-brand-orange hover:text-brand-orange"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B10] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)]" data-testid="gallery-viewer">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-orange/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-blue/80" />
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] text-white/45">
              {slide.category.toLowerCase()}.orynticlabs.design
            </span>
            <span className="ml-auto rounded-full bg-brand-orange/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange">
              {slide.category}
            </span>
          </div>

          <div className="relative h-64 overflow-hidden md:h-[26rem]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.img
                key={slide.title}
                src={slide.image}
                alt={slide.title}
                initial={{ opacity: 0, x: 60 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 * dir }}
                transition={{ duration: 0.45, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
              <p className="font-display text-xl font-bold tracking-tight md:text-2xl">{slide.title}</p>
              <p className="mt-1 text-sm text-white/60">{slide.desc}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2" data-testid="gallery-thumbnails">
          {GALLERY.map((g, i) => (
            <button
              key={g.title}
              onClick={() => go(i, i > index ? 1 : -1)}
              data-testid={`gallery-thumb-${i}`}
              aria-label={g.title}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 md:h-20 md:w-32 ${
                i === index ? "border-brand-orange shadow-[0_0_20px_-4px_rgba(255,85,0,0.5)]" : "border-white/10 opacity-50 hover:opacity-90"
              }`}
            >
              <img src={g.image} alt={g.title} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-4 flex justify-center gap-2">
          {GALLERY.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > index ? 1 : -1)}
              data-testid={`gallery-dot-${i}`}
              aria-label={`Go to design ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-brand-orange" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </Reveal>
    </div>
  );
}

export default function UIShowcase() {
  return (
    <section data-testid="ui-showcase" className="bg-mesh-brand relative overflow-hidden py-24 text-white md:py-32">
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <Overline>Interface Craft</Overline>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                Premium UI for Websites <span className="text-brand-blue">&</span> <span className="text-brand-orange">Dashboards.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl leading-relaxed text-white/60">
                Design is the layer that decides whether a product is used or abandoned. Our interfaces
                are built to be implemented accurately — pixel-true, motion-rich, and engineered for
                real data, not dummy screenshots.
              </p>
            </Reveal>
            <div className="mt-10 space-y-7">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={0.08 * i}>
                    <div className="group flex gap-5" data-testid={`ui-feature-${i}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-300 group-hover:border-brand-orange/50">
                        <Icon className="h-5 w-5 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold tracking-tight">{f.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/50">{f.text}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={0.35}>
              <Link
                to="/services"
                data-testid="ui-showcase-cta"
                className="group mt-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange"
              >
                Explore our UI/UX practice
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B10] shadow-[0_50px_100px_-40px_rgba(0,102,255,0.35)]"
                data-testid="dashboard-frame"
              >
                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
                  <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-orange/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-blue/80" />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] text-white/45">
                    dashboard.orynticlabs.com
                  </span>
                </div>
                <img src={IMAGES.dashboard} alt="Premium analytics dashboard interface designed by OrynticLabs" className="h-72 w-full object-cover md:h-[26rem]" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="absolute -left-4 bottom-8 rounded-2xl border border-white/15 bg-[#0B0B10]/90 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl md:-left-10"
                data-testid="floating-revenue-card"
              >
                <div className="flex items-center justify-between gap-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Monthly Revenue</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange">
                    <TrendingUp className="h-3.5 w-3.5" /> +128%
                  </span>
                </div>
                <div className="mt-4 flex h-16 items-end gap-1.5">
                  {BARS.map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: `${h}%` }}
                      className={`w-4 origin-bottom rounded-t-sm ${i % 2 === 0 ? "bg-brand-blue" : "bg-brand-orange"}`}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                className="absolute -right-3 top-6 flex items-center gap-3 rounded-full border border-white/15 bg-[#0B0B10]/90 py-3 pl-3 pr-6 shadow-2xl shadow-black/50 backdrop-blur-xl md:-right-8"
                data-testid="floating-deploy-pill"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/20">
                  <CheckCircle2 className="h-4 w-4 text-brand-blue" />
                </span>
                <span>
                  <span className="block text-xs font-bold text-white">Build deployed</span>
                  <span className="block text-[10px] text-white/45">Zero downtime · 42s</span>
                </span>
              </motion.div>
            </div>
          </Reveal>
        </div>

        <Gallery />
      </div>
    </section>
  );
}
