"use client";

import { motion } from "framer-motion";
import { PRODUCTS } from "@site/data/content";
import { PageHero, Reveal, Overline, ArrowLink } from "@site/components/site/Reveal";
import { Check } from "lucide-react";

/*
 * Floating product image — the "continuous subtle animation on the visual to
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
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 md:px-10 lg:grid-cols-2">
        <div className={flip ? "lg:order-2" : ""}>
          <Reveal>
            <Overline color="orange">Product 0{index + 1}</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-4xl md:text-6xl font-black tracking-tighter">{product.name}</h2>
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
        <Reveal delay={0.15} className={flip ? "lg:order-1" : ""}>
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
            <div className="overflow-hidden rounded-3xl border border-white/10 glow-orange">
              <img src={product.image} alt={`${product.name} product visual`} className="h-80 w-full object-cover md:h-[30rem]" />
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
      <PageHero
        overline="Internal products"
        lines={["PRODUCTS", "BUILT FOR", "SCALE."]}
        accentIndex={2}
        description="Used internally, offered to clients as part of engagements, and in some cases available as standalone products."
      />
      {PRODUCTS.map((p, i) => (
        <ProductBlock key={p.id} product={p} index={i} flip={i % 2 === 1} />
      ))}
      <section className="bg-brand-ink py-24 text-center text-white md:py-32" data-testid="products-cta">
        <Reveal>
          <h2 className="mx-auto max-w-3xl px-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Want one of these running inside <span className="text-brand-orange">your</span> business?
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10">
            <ArrowLink to="/contact-us">Talk to us</ArrowLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
