"use client";

import { Reveal, Overline } from "@site/components/site/Reveal";

/**
 * Shared FAQ section - uniform CSS grid layout so cards in each row align
 * horizontally at identical baselines with consistent spacing.
 */
export default function FAQGrid({
  overline,
  title = "Frequently asked questions",
  description,
  items,
  testId = "faq",
  titleClassName = "text-2xl md:text-5xl uppercase",
  wrapperClassName = "max-w-3xl",
}) {
  return (
    <section className="bg-brand-ink py-20 text-white md:py-28" data-testid={testId}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className={wrapperClassName}>
            {overline && <Overline color="orange">{overline}</Overline>}
            <h2 className={`font-display font-bold tracking-tight leading-[1.08] ${overline ? "mt-4" : ""} ${titleClassName}`}>
              {title}
            </h2>
            {description && (
              <p className="mt-5 text-base md:text-lg leading-relaxed text-white/60">
                {description}
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.q}
                data-testid={`${testId}-card-${i}`}
                className="flex flex-col justify-start rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-300 hover:border-brand-orange/40 hover:bg-white/[0.06]"
              >
                <p className="font-display text-base font-bold tracking-tight text-white">{item.q}</p>
                <p className="mt-3.5 flex-1 text-sm leading-relaxed text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
