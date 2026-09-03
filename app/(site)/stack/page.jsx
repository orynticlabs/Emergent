import { TECH_GROUPS } from "@site/data/content";
import { PageHero, Reveal, SectionHead, ArrowLink } from "@site/components/site/Reveal";
import Ribbon from "@site/components/site/Ribbon";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Technology Stack",
  description:
    "We are technology-agnostic by principle. We choose the right tool for the problem — not the one that is trending or the one that is easiest to sell.",
  path: "/stack",
});

export default function TechStack() {
  return (
    <main data-testid="stack-page">
      <PageHero
        overline="Technology stack"
        lines={["THE TOOLS", "BEHIND THE", "CRAFT."]}
        accentIndex={1}
        description="We are technology-agnostic by principle. We choose the right tool for the problem — not the one that is trending or the one that is easiest to sell."
      />

      <Ribbon items={["Next.js", "PyTorch", "Kubernetes", "PostgreSQL", "LangGraph", "React Native", "Kafka", "Terraform", "Figma"]} dark={false} />

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="stack-grid-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            dark={false}
            overline="Full spectrum"
            title="An honest picture of what we work with — and why it matters."
          />
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 md:grid-cols-2 lg:grid-cols-3">
            {TECH_GROUPS.map((group, i) => (
              <Reveal key={group.name} delay={0.04 * i} className="bg-brand-paper">
                <div
                  data-testid={`stack-group-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="group h-full p-8 transition-colors duration-300 hover:bg-white md:p-10"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-brand-blue">
                      {group.name}
                    </h3>
                    <span className="font-display text-xs font-bold text-black/25">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
                    {group.tools.map((tool, j) => (
                      <span key={tool} className="text-sm text-black/55 transition-colors duration-200 hover:text-brand-orange">
                        {tool}{j < group.tools.length - 1 && <span className="ml-3 text-black/20">/</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="hidden lg:block bg-brand-paper" aria-hidden="true" />
            <div className="hidden lg:block bg-brand-paper" aria-hidden="true" />
          </div>
          <Reveal delay={0.2}>
            <p className="mt-12 max-w-2xl text-sm leading-relaxed text-black/50">
              We work with new technologies as they mature and prove themselves in production. The stack
              above reflects what we use today — and it evolves as the landscape evolves. Working with a
              technology not listed here? Ask us. The answer is likely yes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="stack-cta">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 md:flex-row md:items-end md:px-10">
          <Reveal>
            <h2 className="max-w-2xl font-display text-4xl md:text-5xl font-bold tracking-tight">
              The right stack for <span className="text-brand-orange">your</span> problem starts with a conversation.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <ArrowLink to="/contact-us">Talk to an engineer</ArrowLink>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
