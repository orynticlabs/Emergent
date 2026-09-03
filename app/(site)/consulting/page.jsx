import { Compass, GitBranch, Map, ShieldCheck } from "lucide-react";
import { IMAGES } from "@site/data/content";
import { PageHero, Reveal, SectionHead, ArrowLink } from "@site/components/site/Reveal";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Technology Consulting",
  description:
    "Advisory work for founders, CTOs, and heads of product — architecture evaluation, migration planning, vendor assessment, and technology roadmaps. Structured, time-bound, and outcome-focused.",
  path: "/consulting",
  image: IMAGES.architecture,
});

const COVERAGE = [
  {
    icon: Compass,
    title: "Architecture Evaluation",
    text: "An honest read on your current system — where it will hold under growth, where it will not, and what to fix first versus what can wait.",
  },
  {
    icon: GitBranch,
    title: "Migration Planning",
    text: "Cloud moves, framework upgrades, monolith-to-services splits — sequenced so the business keeps running while the platform changes under it.",
  },
  {
    icon: ShieldCheck,
    title: "Vendor & Tooling Assessment",
    text: "Independent evaluation of the platforms and vendors you're considering, scored against your actual constraints — not their sales deck.",
  },
  {
    icon: Map,
    title: "Technology Roadmaps",
    text: "A sequenced plan tying engineering investment to business milestones, so budget conversations start from evidence instead of guesswork.",
  },
];

const ENGAGEMENT = [
  { n: "01", title: "Discovery call", text: "A structured conversation about your roadmap, constraints, and the decision you're actually trying to make — no generic questionnaire." },
  { n: "02", title: "Structured assessment", text: "We review the system, the team, and the constraints directly — architecture, code, infrastructure, or vendor proposals, whichever the engagement calls for." },
  { n: "03", title: "Findings & roadmap", text: "A written report: what's actually true about your system today, the risk ranked by what matters, and a sequenced plan — not a slide deck of buzzwords." },
  { n: "04", title: "Optional execution handoff", text: "If you want the same team to build what we recommended, we can — the same engineers who wrote the roadmap ship it. Never required." },
];

export default function Consulting() {
  return (
    <main data-testid="consulting-page">
      <PageHero
        overline="Technology Consulting"
        lines={["ADVICE", "THAT", "SHIPS."]}
        accentIndex={1}
        description="Advisory work for founders, CTOs, and heads of product — architecture evaluation, migration planning, vendor assessment, and technology roadmaps. Structured, time-bound, and outcome-focused. We never bill indefinitely for advice."
      />

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="consulting-coverage-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            dark={false}
            overline="What we cover"
            title="Four kinds of decisions we get called in for."
            description="Every engagement starts with a documented scope — what we're evaluating, what you'll receive, and by when."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {COVERAGE.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={0.06 * i}>
                  <div
                    data-testid={`consulting-coverage-${i}`}
                    className="group h-full rounded-3xl border border-black/10 bg-white p-10 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10"
                  >
                    <Icon className="h-10 w-10 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                    <h3 className="mt-8 font-display text-2xl font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-4 leading-relaxed text-black/55">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="consulting-engagement-section">
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-brand-blue/15 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead
                overline="How an engagement runs"
                title="Time-bound, from first call to final report."
                description="No open-ended retainers. Every engagement has a defined start, a defined deliverable, and a defined end."
              />
              <Reveal delay={0.3}>
                <div className="mt-10 overflow-hidden rounded-3xl border border-white/10">
                  <img src={IMAGES.architecture} alt="Architecture and systems planning" className="h-64 w-full object-cover" />
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              {ENGAGEMENT.map((step, i) => (
                <Reveal key={step.n} delay={0.07 * i}>
                  <div className="group grid gap-4 border-b border-white/10 py-8 transition-colors duration-300 hover:border-brand-blue/40 md:grid-cols-12">
                    <span className="font-display text-4xl font-black tracking-tighter text-outline-light md:col-span-2">{step.n}</span>
                    <div className="md:col-span-10">
                      <h3 className="font-display text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-brand-blue">{step.title}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">{step.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="consulting-cta-section">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <SectionHead
            dark={false}
            align="center"
            wrapperClassName="max-w-2xl"
            overline="Ready when you are"
            title="Bring us the decision you're stuck on."
          />
          <div className="mt-8 flex justify-center">
            <ArrowLink to="/contact-us" variant="blue">Book a consultation</ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
