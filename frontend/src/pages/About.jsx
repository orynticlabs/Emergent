import { IMAGES, WHY_US } from "@/data/content";
import { PageHero, Reveal, SectionHead, ArrowLink } from "@/components/site/Reveal";
import { Check } from "lucide-react";

const MODELS = [
  { name: "SaaS", text: "Software as a Service — subscribe to platforms we build, host, and evolve for you." },
  { name: "PaaS", text: "Platform as a Service — build on our proprietary platforms like OryAI and OryCMS." },
  { name: "Custom", text: "Project-based engagements — scoped, sprinted, and delivered around your exact requirements." },
];

const METRICS = [
  { value: "08", label: "Service practices under one roof" },
  { value: "03", label: "Proprietary products in production" },
  { value: "11", label: "Industries with delivered work" },
  { value: "02wk", label: "Sprint cadence, demo every Friday" },
];

export default function About() {
  return (
    <main data-testid="about-page">
      <PageHero
        overline="Who we are"
        lines={["BUILT FOR THE ERA OF", "INTELLIGENT", "SOFTWARE."]}
        accentIndex={1}
        description="OrynticLabs is not a generalist IT vendor. We are a focused engineering and product studio that combines deep technical expertise with design intelligence and business understanding."
      />

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="about-story">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-display text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                "Technology should solve <span className="text-brand-orange">real problems</span>, move fast, and <span className="text-brand-blue">last long</span>."
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <p className="text-base md:text-lg leading-relaxed text-black/60">
                We design, build, and deliver custom technology solutions across the complete software
                lifecycle — from early-stage product thinking to enterprise-scale deployment. Every
                solution we build is grounded in one belief: software is only worth building when it
                creates a result that matters.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-base md:text-lg leading-relaxed text-black/60">
                We operate across three delivery models, giving clients the flexibility to work with
                us in whatever way fits their business best.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {MODELS.map((m, i) => (
                <Reveal key={m.name} delay={0.1 * i}>
                  <div className="h-full rounded-2xl border border-black/10 bg-white p-6 transition-transform duration-300 hover:-translate-y-1" data-testid={`model-card-${m.name.toLowerCase()}`}>
                    <p className="font-display text-lg font-bold text-brand-orange">{m.name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-black/55">{m.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="about-metrics">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={0.08 * i} className="bg-brand-ink">
                <div className="p-10 md:p-12">
                  <p className="font-display text-5xl md:text-6xl font-black tracking-tighter text-brand-orange">{m.value}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/50">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="about-culture">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            dark={false}
            overline="The studio"
            title="Engineers, designers, and product thinkers — in the same room."
            description="The people on your kickoff call are the people building your product. Our founders are directly involved in the work."
          />
          <div className="mt-16 grid gap-6 md:grid-cols-12">
            <Reveal className="md:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-black/10">
                <img src={IMAGES.about} alt="OrynticLabs engineering team collaborating" className="h-80 w-full object-cover transition-transform duration-700 hover:scale-105 md:h-[28rem]" />
              </div>
            </Reveal>
            <Reveal delay={0.15} className="md:col-span-5 md:pt-16">
              <div className="overflow-hidden rounded-3xl border border-black/10">
                <img src={IMAGES.culture} alt="Team working session" className="h-72 w-full object-cover transition-transform duration-700 hover:scale-105 md:h-80" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="about-why">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            overline="Why us"
            title="What is genuinely different about working with us."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={0.07 * i}>
                <div className="flex h-full gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/50">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-brand-orange" strokeWidth={2.5} />
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight">{w.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{w.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-16">
              <ArrowLink to="/contact">Work with us</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
