"use client";

import { motion } from "framer-motion";
import { PRODUCTS, IMAGES } from "@site/data/content";
import { Reveal, Overline, SectionHead, ArrowLink, KineticLine, Magnetic, EASE } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";
import { Check } from "lucide-react";

function ProductsHero() {
  return (
    <section data-testid="page-hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink text-white">
      <img src={IMAGES.architecture} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#050505]/65" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/30 to-[#050505]" aria-hidden="true" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-brand-orange/20 blur-[110px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-brand-blue/20 blur-[120px]"
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-36 pb-28 text-center md:px-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/60" data-testid="hero-overline">
            Oryntic Labs - Products
          </p>
        </motion.div>

        <h1 className="mt-10 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
          <KineticLine delay={0.15}>Products Built for</KineticLine>
          <KineticLine delay={0.27}>
            <CanvasText
              text="Scale & Production."
              className="font-display text-5xl font-black sm:text-6xl lg:text-7xl"
              colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
              lineGap={6}
              animationDuration={10}
            />
          </KineticLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-white/65"
        >
          Used internally, offered to clients as part of engagements, and engineered to run reliably at scale. Battle-tested proprietary systems ready for production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ArrowLink to="#products-list">Explore Products</ArrowLink>
          </Magnetic>
          <Magnetic strength={12}>
            <ArrowLink to="/contact-us" variant="ghost" className="border-white/30 text-white backdrop-blur-md">
              Talk to Our Team
            </ArrowLink>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

/*
 * Floating product image - the "continuous subtle animation on the visual to
 * draw attention" idea from 21st.dev's "Feature Spotlight" pattern; literal
 * source wasn't retrievable (daily retrieval limit), so this is the pattern
 * re-built with framer-motion, not copied code.
 */

function ProductBlock({ product, index, flip }) {
  return (
    <section
      data-testid={`product-section-${product.id}`}
      className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-orange/10 blur-[130px]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:gap-14 px-6 md:px-10 lg:grid-cols-12">
        <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
          <Reveal>
            <Overline color="orange">Product 0{index + 1}</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-black tracking-tighter">{product.name}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-2 text-lg font-medium text-brand-orange">{product.tagline}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 leading-relaxed text-white/60">{product.description}</p>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {product.features.map((f, i) => (
              <Reveal key={f} delay={0.05 * i}>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2.5} />
                  <p className="text-sm leading-relaxed text-white/70">{f}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.15} className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -top-4 left-6 z-10 rounded-full border border-white/10 bg-brand-ink/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-orange shadow-lg backdrop-blur-md"
            >
              Internal product
            </motion.span>
            <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/15 bg-[#09090b]/80 p-2 sm:p-2.5 shadow-2xl glow-orange backdrop-blur-md">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-black/40">
                <img
                  src={product.image}
                  alt={`${product.name} product visual`}
                  className="w-full h-auto object-contain block transition-transform duration-500 hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

export default function ProductsClient() {
  return (
    <main data-testid="products-page">
      <ProductsHero />
      <div id="products-list">
        {PRODUCTS.map((p, i) => (
          <ProductBlock key={p.id} product={p} index={i} flip={i % 2 === 1} />
        ))}
      </div>
      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="products-cta">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Deploy in your business"
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-3xl"
            title={
              <>
                Want one of these,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">running inside your business?</span>
              </>
            }
            description="Deploy any of our internal platforms directly, or let our engineering team customize and integrate them into your existing infrastructure."
          />
          <Reveal delay={0.2}>
            <div className="mt-10 flex justify-start">
              <ArrowLink to="/contact-us">Talk to us</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
