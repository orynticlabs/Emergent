import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { IMAGES, SERVICES, PRODUCTS, WHY_US, MARQUEE_ITEMS, PROCESS } from "@/data/content";
import { Reveal, KineticLine, Overline, SectionHead, ArrowLink, EASE } from "@/components/site/Reveal";
import Ribbon from "@/components/site/Ribbon";

const STATS = [
  { value: "08", label: "Service practices" },
  { value: "03", label: "Proprietary products" },
  { value: "11", label: "Industries served" },
  { value: "100%", label: "Founder-led delivery" },
];

const BENTO_SPANS = [
  "md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4",
  "md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-4",
];

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} data-testid="home-hero" className="relative flex min-h-screen items-center overflow-hidden bg-brand-ink bg-grid-dark text-white">
      <motion.div
        aria-hidden="true"
        className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-brand-blue/25 blur-[130px]"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-brand-orange/20 blur-[130px]"
        animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div style={{ opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-20 md:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <Overline>OrynticLabs — Full-Spectrum Technology Studio</Overline>
            </motion.div>

            <h1 className="mt-8 font-display text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
              <KineticLine delay={0.15}>ENGINEERING</KineticLine>
              <KineticLine delay={0.27}><span className="text-brand-orange">INTELLIGENT</span></KineticLine>
              <KineticLine delay={0.39}>SOFTWARE<span className="text-brand-blue">.</span></KineticLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
              className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-white/60"
            >
              We design, build, and deliver custom technology across the complete software
              lifecycle — from early-stage product thinking to enterprise-scale deployment.
              Technology that solves real problems, moves fast, and lasts long.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <ArrowLink to="/contact">Start a Project</ArrowLink>
              <ArrowLink to="/services" variant="ghost" className="text-white">Explore Services</ArrowLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.95 }}
              className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4"
              data-testid="hero-stats"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-white/40">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
              style={{ y: imgY }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl border border-white/10 glow-blue">
                <img src={IMAGES.hero} alt="Futuristic abstract light architecture" className="h-[34rem] w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/10 bg-brand-ink/80 px-6 py-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Delivery models</p>
                <p className="mt-1 font-display text-lg font-bold">SaaS · PaaS · Custom</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-6 rounded-full border border-white/30 p-1.5"
        >
          <div className="h-2 w-full rounded-full bg-brand-orange" />
        </motion.div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section data-testid="manifesto-section">
      {PROCESS.slice(0, 4).map((step, i) => {
        const dark = i % 2 === 1;
        return (
          <div key={step.n} className={dark ? "bg-brand-ink text-white" : "bg-brand-paper text-brand-coal"}>
            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-24 md:grid-cols-12 md:px-10 md:py-32">
              <div className="md:col-span-4">
                <Reveal>
                  <span className={`font-display text-7xl md:text-9xl font-black tracking-tighter ${dark ? "text-outline-light" : "text-outline-dark"}`}>
                    {step.n}
                  </span>
                </Reveal>
              </div>
              <div className="md:col-span-8 md:pt-6">
                <Reveal delay={0.1}>
                  <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tight">{step.title}</h3>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className={`mt-6 max-w-2xl text-base md:text-lg leading-relaxed ${dark ? "text-white/60" : "text-black/60"}`}>
                    {step.text}
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ServicesBento() {
  return (
    <section data-testid="home-services" className="bg-brand-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead
            overline="What we do"
            title="Full-stack capability, one accountable team."
            description="Eight practices covering the complete software lifecycle — no coordination gaps between agencies that have never spoken to each other."
          />
          <Reveal delay={0.2}>
            <Link to="/services" data-testid="services-view-all" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
              All services <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.id} delay={0.06 * i} className={BENTO_SPANS[i]}>
                <Link
                  to="/services"
                  data-testid={`service-card-${s.id}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/60 hover:bg-white/[0.05]"
                >
                  <div>
                    <Icon className="h-8 w-8 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                    <h3 className="mt-6 font-display text-xl md:text-2xl font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">{s.blurb}</p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40 transition-colors duration-300 group-hover:text-brand-orange">
                    Explore <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductsTeaser() {
  return (
    <section data-testid="home-products" className="bg-brand-paper py-24 text-brand-coal md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          dark={false}
          overline="Internal products"
          title="Systems we built for ourselves — and now ship."
          description="OryAI, OryCMS, and PerformX are not theoretical. They run our own operations every day."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.id} delay={0.1 * i} className={i === 1 ? "md:translate-y-10" : i === 2 ? "md:translate-y-20" : ""}>
              <Link
                to="/products"
                data-testid={`product-teaser-${p.id}`}
                className="group block overflow-hidden rounded-3xl border border-black/10 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-6 top-6 rounded-full bg-brand-ink/70 px-4 py-1.5 text-xs font-bold tracking-widest text-white backdrop-blur-md">
                    0{i + 1}
                  </span>
                </div>
                <div className="p-8">
                  <h3 className="font-display text-2xl font-bold tracking-tight">{p.name}</h3>
                  <p className="mt-1 text-sm font-medium text-brand-blue">{p.tagline}</p>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-black/55">{p.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                    View product <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
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

export default function Home() {
  return (
    <main data-testid="home-page">
      <Hero />
      <Ribbon items={MARQUEE_ITEMS} dark />
      <Manifesto />
      <ServicesBento />
      <Ribbon items={["OryAI", "OryCMS", "PerformX", "Staff Augmentation", "Technology Consulting"]} dark={false} />
      <ProductsTeaser />
      <WhyBand />
    </main>
  );
}
