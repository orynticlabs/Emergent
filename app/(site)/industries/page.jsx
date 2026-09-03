import { INDUSTRIES, IMAGES } from "@site/data/content";
import { PageHero, Reveal, ArrowLink } from "@site/components/site/Reveal";
import { ArrowUpRight } from "lucide-react";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Industries",
  description:
    "Our approach in every industry is the same: understand the domain deeply before proposing a solution, then build something that fits how that industry actually works.",
  path: "/industries",
  image: IMAGES.architecture,
});

export default function Industries() {
  return (
    <main data-testid="industries-page">
      <PageHero
        overline="Industries"
        lines={["DEEP DOMAIN,", "REAL", "DELIVERY."]}
        accentIndex={1}
        description="Our approach in every industry is the same: understand the domain deeply before proposing a solution, then build something that fits how that industry actually works."
      />

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="industries-list-section">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:px-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-32">
              <Reveal>
                <div className="overflow-hidden rounded-3xl border border-black/10">
                  <img src={IMAGES.architecture} alt="Enterprise scale architecture" className="h-[30rem] w-full object-cover" />
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-6 text-sm leading-relaxed text-black/55">
                  Eleven industries. One standard: software that fits how the domain actually works.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-8">
            {INDUSTRIES.map((ind, i) => (
              <Reveal key={ind.name} delay={0.04 * i}>
                <div
                  data-testid={`industry-row-${i}`}
                  className="group flex items-start justify-between gap-6 border-b border-black/10 py-8 transition-colors duration-300 hover:border-brand-orange/50"
                >
                  <div className="flex gap-6">
                    <span className="pt-1 font-display text-sm font-bold text-black/30">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300 group-hover:text-brand-orange">
                        {ind.name}
                      </h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-black/50">{ind.build}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="mt-2 h-5 w-5 shrink-0 text-black/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-orange" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="industries-cta">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <Reveal>
              <h2 className="max-w-2xl font-display text-4xl md:text-5xl font-bold tracking-tight">
                Your industry not listed? <span className="text-brand-blue">Ask us.</span> The answer is likely yes.
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <ArrowLink to="/contact-us">Start the conversation</ArrowLink>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
