import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight, ArrowRight, Compass, Layers, BrainCircuit, Cloud, Bot, Database, Gauge, Check,
} from "lucide-react";
import {
  IMAGES, SERVICES, PRODUCTS, INDUSTRIES, WHY_US, PROCESS,
  HERO_VIDEO, SERVICE_GROUPS, HOME_STATS, ORYAI_ECOSYSTEM, FAQS, INDUSTRY_IMAGES,
} from "@/data/content";
import { Reveal, KineticLine, Overline, SectionHead, ArrowLink, EASE } from "@/components/site/Reveal";
import Ribbon from "@/components/site/Ribbon";
import ClientMarquee from "@/components/site/ClientMarquee";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ICONS = { Compass, Layers, BrainCircuit, Cloud, Bot, Database, Gauge };
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} data-testid="home-hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        data-testid="hero-video"
        className="absolute inset-0 h-full w-full object-cover"
        poster={IMAGES.hero}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#050505]/65" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/30 to-[#050505]" aria-hidden="true" />

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-36 pb-28 text-center md:px-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/60" data-testid="hero-overline">
            OrynticLabs — Full-Spectrum Technology Company
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.08]">
          <KineticLine delay={0.15}>Engineering the Next Generation of</KineticLine>
          <KineticLine delay={0.27}><span className="font-semibold text-brand-orange">Intelligent Systems</span></KineticLine>
          <KineticLine delay={0.39}>with AI<span className="text-brand-blue">.</span></KineticLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-white/65"
        >
          We design, build, and deliver secure, scalable technology across the complete software
          lifecycle — combining strong architecture, data engineering, and AI capability to move
          organizations from strategy to reliable systems in production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <ArrowLink to="/contact">Consult Our Strategy Team</ArrowLink>
          <ArrowLink to="/services" variant="ghost" className="border-white/30 text-white backdrop-blur-md">Explore Services</ArrowLink>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-6 rounded-full border border-white/40 p-1.5"
        >
          <div className="h-2 w-full rounded-full bg-brand-orange" />
        </motion.div>
      </div>
    </section>
  );
}

function ServicesShowcase() {
  return (
    <section data-testid="home-services" className="bg-brand-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          overline="What we do"
          title={<>Beyond Development.<br />We Engineer <span className="text-brand-orange">Transformation.</span></>}
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_GROUPS.map((g, i) => {
            const Icon = ICONS[g.icon];
            return (
              <Reveal key={g.title} delay={0.08 * i}>
                <div
                  data-testid={`service-group-${g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/60 hover:bg-white/[0.05]"
                >
                  <Icon className="h-10 w-10 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                  <h3 className="mt-7 font-display text-xl font-bold leading-snug tracking-tight">{g.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{g.text}</p>
                  <Link to="/services" className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                    {g.link}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-12">
            <ArrowLink to="/services" variant="ghost" className="border-white/25 text-white">View All 8 Service Practices</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProductsShowcase() {
  const [active, setActive] = useState(0);
  const product = PRODUCTS[active];

  return (
    <section data-testid="home-products" className="bg-brand-paper py-24 text-brand-coal md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          dark={false}
          overline="Internal products"
          title={<>Innovation, Engineered by <span className="text-brand-blue">OrynticLabs</span></>}
          description="Systems we built for ourselves and now ship to clients — running in production every day."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  data-testid={`product-tab-${p.id}`}
                  className={`flex min-w-[220px] items-center justify-between rounded-2xl border px-6 py-5 text-left transition-all duration-300 lg:min-w-0 ${
                    active === i
                      ? "border-brand-orange bg-brand-ink text-white shadow-xl shadow-black/15"
                      : "border-black/10 bg-white text-brand-coal hover:border-brand-orange/50"
                  }`}
                >
                  <span>
                    <span className="block font-display text-lg font-bold tracking-tight">{p.name}</span>
                    <span className={`mt-0.5 block text-xs ${active === i ? "text-white/50" : "text-black/45"}`}>{p.tagline}</span>
                  </span>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-colors duration-300 ${active === i ? "text-brand-orange" : "text-black/25"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: EASE }}
                data-testid="product-showcase-panel"
                className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl shadow-black/5"
              >
                <div className="relative h-64 overflow-hidden md:h-72">
                  <img src={product.image} alt={`${product.name} visual`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">OrynticLabs Product Suite</p>
                    <p className="mt-1 font-display text-3xl font-black tracking-tight text-white md:text-4xl">{product.name}</p>
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <p className="leading-relaxed text-black/60">{product.description}</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {product.features.slice(0, 4).map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" strokeWidth={2.5} />
                        <p className="text-sm text-black/70">{f}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-9">
                    <ArrowLink to="/products">View Product</ArrowLink>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsShowcase() {
  return (
    <section data-testid="home-stats-section" className="bg-brand-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          overline="The studio in numbers"
          title={<>Capability you can <span className="text-brand-orange">measure.</span></>}
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.08 * i}>
              <div
                data-testid={`stat-card-${i}`}
                className="group relative h-80 overflow-hidden rounded-3xl border border-white/10"
              >
                <img
                  src={IMAGES[s.image]}
                  alt={s.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/55 to-[#050505]/20" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="font-display text-5xl font-black tracking-tighter text-brand-orange">{s.value}</p>
                  <p className="mt-2 font-display text-lg font-bold tracking-tight">{s.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{s.caption}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OryAISection() {
  return (
    <section data-testid="home-oryai" className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32">
      <div className="absolute -left-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-brand-blue/15 blur-[140px]" aria-hidden="true" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-brand-orange/10 blur-[130px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Overline>OryAI — Our AI Core</Overline>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                Building an AI Ecosystem That Aligns With <span className="text-brand-blue">Your Organization</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 leading-relaxed text-white/60">
                OryAI is our proprietary AI intelligence platform — the infrastructure layer underneath
                every AI feature we build. From custom agents to RAG pipelines, we move your business
                beyond the hype into practical, production-grade AI.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-9 flex flex-wrap gap-4">
                <ArrowLink to="/contact">Book Your AI Advisory Session</ArrowLink>
                <ArrowLink to="/products" variant="blue">Discover OryAI</ArrowLink>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {ORYAI_ECOSYSTEM.map((card, i) => {
                const Icon = ICONS[card.icon];
                return (
                  <Reveal key={card.title} delay={0.08 * i} className={i === 2 ? "sm:col-span-2" : ""}>
                    <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/50">
                      <Icon className="h-9 w-9 text-brand-orange" strokeWidth={1.5} />
                      <h3 className="mt-6 font-display text-xl font-bold tracking-tight">{card.title}</h3>
                      <ul className={`mt-5 space-y-2.5 ${i === 2 ? "sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0" : ""}`}>
                        {card.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2.5 text-sm text-white/55">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IndustriesTabs() {
  const [active, setActive] = useState(0);
  const industry = INDUSTRIES[active];

  return (
    <section data-testid="home-industries" className="bg-brand-paper py-24 text-brand-coal md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          dark={false}
          overline="Industries"
          title={<>Deep domain expertise, <span className="text-brand-orange">real delivery.</span></>}
          description="We understand the domain deeply before proposing a solution — then build something that fits how your industry actually works."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex flex-wrap gap-2.5">
              {INDUSTRIES.map((ind, i) => (
                <button
                  key={ind.name}
                  onClick={() => setActive(i)}
                  data-testid={`industry-tab-${i}`}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    active === i
                      ? "border-brand-orange bg-brand-orange text-white shadow-lg shadow-brand-orange/25"
                      : "border-black/15 bg-white text-black/65 hover:border-brand-orange/60 hover:text-brand-orange"
                  }`}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
                data-testid="industry-panel"
                className="grid overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl shadow-black/5 md:grid-cols-2"
              >
                <div className="relative h-60 md:h-auto">
                  <img
                    src={IMAGES[INDUSTRY_IMAGES[active % INDUSTRY_IMAGES.length]]}
                    alt={industry.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                </div>
                <div className="p-8 md:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Industry {String(active + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-display text-3xl font-black tracking-tight">{industry.name}</h3>
                  <p className="mt-4 leading-relaxed text-black/60">{industry.build}</p>
                  <Link to="/industries" data-testid="industry-know-more" className="group mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                    Know More
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyBand() {
  return (
    <section data-testid="home-why" className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32">
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-orange/10 blur-[130px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead
              overline="Why OrynticLabs"
              title="A lot of companies write code. Fewer own outcomes."
            />
            <Reveal delay={0.3}>
              <div className="mt-10">
                <ArrowLink to="/about">More about us</ArrowLink>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={0.08 * i}>
                <div className="group flex gap-6 border-b border-white/10 py-7 transition-colors duration-300 hover:border-brand-orange/40">
                  <span className="font-display text-sm font-bold text-brand-orange">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-brand-orange">{w.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{w.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section data-testid="home-faq" className="bg-brand-paper py-24 text-brand-coal md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead
              dark={false}
              overline="FAQ"
              title={<>Frequently Asked <span className="text-brand-blue">Questions</span></>}
              description="Didn't find what you were looking for? Reach out — a real engineer reads every message."
            />
            <Reveal delay={0.3}>
              <div className="mt-10">
                <ArrowLink to="/contact" variant="blue">Ask your question</ArrowLink>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <Accordion type="single" collapsible data-testid="faq-accordion" className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-black/10" data-testid={`faq-item-${i}`}>
                    <AccordionTrigger className="text-left font-display text-lg font-bold tracking-tight hover:text-brand-orange hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="leading-relaxed text-black/60">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section data-testid="home-cta" className="relative overflow-hidden border-t border-white/10 bg-brand-ink py-24 text-white md:py-32">
      <div className="absolute left-1/2 top-0 h-72 w-[50rem] -translate-x-1/2 rounded-full bg-brand-blue/15 blur-[140px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <h2 className="max-w-4xl font-display text-4xl md:text-6xl font-black tracking-tighter leading-[1.02]">
            Ready to Build Your Next<br />
            <span className="text-brand-orange">Intelligent Product?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl leading-relaxed text-white/55">
            Share a few details about your idea, and our team will come back with technical
            insight, a clear scope, and next steps — not a sales deck.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap gap-4">
            <ArrowLink to="/contact">Start a Project</ArrowLink>
            <ArrowLink to="/stack" variant="ghost" className="border-white/25 text-white">See Our Stack</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main data-testid="home-page">
      <Hero />
      <ClientMarquee />
      <ServicesShowcase />
      <ProductsShowcase />
      <StatsShowcase />
      <OryAISection />
      <IndustriesTabs />
      <WhyBand />
      <FaqSection />
      <CtaBand />
    </main>
  );
}
