"use client";

import { Reveal } from "@site/components/site/Reveal";

/**
 * Shared FAQ section — masonry-style card grid (columns + break-inside-avoid
 * so cards of different heights pack tightly instead of leaving gaps).
 * Originally built for /contact-us; reused as-is anywhere else on the site
 * needs an FAQ block, so every FAQ section reads identically.
 */
export default function FAQGrid({ title = "Frequently asked questions", description, items, testId = "faq" }) {
  return (
    <section className="bg-brand-ink py-20 text-white md:py-28" data-testid={testId}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
          {description && <p className="mt-4 max-w-xl leading-relaxed text-white/50">{description}</p>}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
            {items.map((item, i) => (
              <div
                key={item.q}
                data-testid={`${testId}-card-${i}`}
                className="mb-6 break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-brand-orange/40"
              >
                <p className="font-display text-base font-bold text-white">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
