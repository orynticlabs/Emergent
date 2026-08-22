import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight, ArrowRight, Compass, Layers, BrainCircuit, Cloud, Bot, Database, Gauge, Check,
  Package, Zap, Target, Loader2, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
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

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-36 pb-28 text-center md:px-10">
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
          className="mx-auto mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-white/65"
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
    <section data-testid="home-services" className="bg-mesh-brand relative overflow-hidden py-24 text-white md:py-32">
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
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
                  className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/60 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_-24px_rgba(0,102,255,0.45)]"
                >
                  <Icon className="h-10 w-10 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                  <h3 className="mt-7 font-display text-xl font-bold leading-snug tracking-tight">{g.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{g.text}</p>
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

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4">
            <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  data-testid={`product-tab-${p.id}`}
                  className={`group relative flex min-w-[250px] items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-300 lg:min-w-0 ${
                    active === i
                      ? "border-brand-orange/70 bg-white shadow-[0_24px_50px_-24px_rgba(255,85,0,0.4)] lg:translate-x-2"
                      : "border-black/10 bg-white/60 hover:border-brand-orange/40 hover:bg-white"
                  }`}
                >
                  {active === i && (
                    <span className="absolute inset-y-4 left-0 w-1 rounded-full bg-brand-orange" aria-hidden="true" />
                  )}
                  <span className={`font-display text-sm font-black tracking-widest transition-colors duration-300 ${active === i ? "text-brand-orange" : "text-black/25"}`}>
                    0{i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold tracking-tight">{p.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-black/45">{p.tagline}</span>
                  </span>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-all duration-300 ${active === i ? "translate-x-0.5 text-brand-orange" : "text-black/20 group-hover:text-black/40"}`} />
                </button>
              ))}
            </div>
            <p className="mt-6 hidden max-w-xs text-xs leading-relaxed text-black/40 lg:block">
              Every product ships as part of client engagements — and select products are available standalone.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: EASE }}
                data-testid="product-showcase-panel"
                className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_40px_90px_-40px_rgba(0,0,0,0.3)]"
              >
                <div className="relative h-64 overflow-hidden md:h-80">
                  <img src={product.image} alt={`${product.name} visual`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                  <div className="absolute left-8 top-6 flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      <Package className="h-3.5 w-3.5 text-brand-orange" /> {product.model}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      <Zap className="h-3.5 w-3.5 text-brand-blue" /> In Production
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-8 right-8">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">OrynticLabs Product Suite</p>
                    <p className="mt-1 font-display text-3xl font-black tracking-tight text-white md:text-4xl">{product.name}</p>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <p className="text-base leading-relaxed text-black/60">{product.description}</p>

                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" strokeWidth={2} />
                    <p className="text-sm leading-relaxed text-black/65">
                      <span className="font-bold text-brand-blue">Ideal for:</span> {product.ideal}
                    </p>
                  </div>

                  <p className="mt-9 text-xs font-bold uppercase tracking-[0.25em] text-black/40">What's inside</p>
                  <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {product.features.slice(0, 6).map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" strokeWidth={2.5} />
                        <p className="text-sm text-black/70">{f}</p>
                      </div>
                    ))}
                  </div>
                  {product.features.length > 6 && (
                    <p className="mt-3 text-xs font-medium text-black/40">
                      + {product.features.length - 6} more capabilities
                    </p>
                  )}

                  <div className="mt-9 flex flex-wrap gap-4">
                    <ArrowLink to="/products">View Product</ArrowLink>
                    <ArrowLink to="/contact" variant="ghost" className="border-black/20 text-brand-coal hover:bg-black/5">Discuss Fit</ArrowLink>
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
  const [form, setForm] = useState({ name: "", phone: "", email: "", timeline: "", project: "" });
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", phone: "", email: "", timeline: "", project: "" });
      toast.success("Request received. Our strategy team will reach out within 24 hours.");
    }, 900);
  };

  const lineInput =
    "w-full border-b border-white/20 bg-transparent py-3.5 text-sm text-white placeholder:text-white/40 outline-none transition-colors duration-300 focus:border-brand-orange";

  return (
    <section data-testid="home-cta" className="bg-mesh-brand relative overflow-hidden border-t border-white/10 py-24 text-white md:py-32">
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
        <div
          className="absolute left-1/2 top-1/2 hidden h-56 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-blue via-white/40 to-brand-orange lg:block"
          aria-hidden="true"
        />

        <div>
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.12]">
              Partner with tech catalysts who transform ideas into <span className="text-brand-orange">impact.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-base text-white/55 md:text-lg">Book your consultation with us.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-12 font-display text-6xl md:text-7xl font-black tracking-tight">
              Let's Talk<span className="text-brand-orange">!</span>
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <form
            onSubmit={submit}
            data-testid="cta-form"
            className="rounded-3xl border border-brand-blue/40 bg-gradient-to-br from-brand-blue/[0.14] via-white/[0.03] to-transparent p-8 backdrop-blur-xl glow-blue md:p-10"
          >
            <h3 className="font-display text-2xl font-bold tracking-tight">Speak With Our Experts</h3>
            <div className="mt-8 space-y-6">
              <input required placeholder="Full Name" value={form.name} onChange={set("name")} data-testid="cta-input-name" className={lineInput} />
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-white/20 pr-3 text-sm font-medium text-white/60">+91</span>
                <input type="tel" placeholder="Mobile Number" value={form.phone} onChange={set("phone")} data-testid="cta-input-phone" className={`${lineInput} pl-14`} />
              </div>
              <input required type="email" placeholder="Business Email" value={form.email} onChange={set("email")} data-testid="cta-input-email" className={lineInput} />
              <div className="relative">
                <select required value={form.timeline} onChange={set("timeline")} data-testid="cta-input-timeline" className={`${lineInput} appearance-none pr-8 ${form.timeline ? "" : "text-white/40"}`}>
                  <option value="" disabled className="bg-brand-ink text-white">When do you want to launch a solution?</option>
                  <option value="Immediately" className="bg-brand-ink text-white">Immediately</option>
                  <option value="2-3 months" className="bg-brand-ink text-white">2–3 months</option>
                  <option value="4-6 months" className="bg-brand-ink text-white">4–6 months</option>
                  <option value="After 6 months" className="bg-brand-ink text-white">After 6 months</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              </div>
              <textarea rows={3} placeholder="About Project" value={form.project} onChange={set("project")} data-testid="cta-input-project" className={`${lineInput} resize-none`} />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={sending}
              data-testid="cta-submit-button"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-orange px-12 py-3.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Submitting..." : "Submit"}
            </motion.button>
          </form>
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
