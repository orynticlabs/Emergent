import { SERVICES, PROCESS, IMAGES } from "@site/data/content";
import { PageHero, Reveal, SectionHead, ArrowLink } from "@site/components/site/Reveal";
import { Users, Compass } from "lucide-react";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Services",
  description:
    "Eight practices across the complete software lifecycle — web, product, custom software, mobile, AI/ML, data, cloud, and design.",
  path: "/services",
  image: IMAGES.datacenter,
});

export default function Services() {
  return (
    <main data-testid="services-page">
      <PageHero
        overline="What we do"
        lines={["EVERYTHING", "SOFTWARE", "DEMANDS."]}
        accentIndex={1}
        description="Eight practices across the complete software lifecycle — web, product, custom software, mobile, AI/ML, data, cloud, and design."
      />

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="services-grid-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.id} delay={0.05 * i}>
                  <div
                    data-testid={`service-detail-${s.id}`}
                    className="group h-full rounded-3xl border border-black/10 bg-white p-10 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10"
                  >
                    <div className="flex items-start justify-between">
                      <Icon className="h-10 w-10 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                      <span className="font-display text-sm font-bold text-black/25">0{i + 1}</span>
                    </div>
                    <h3 className="mt-8 font-display text-2xl md:text-3xl font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-4 leading-relaxed text-black/55">{s.blurb}</p>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {s.tags.map((t) => (
                        <span key={t} className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-medium text-black/60 transition-colors duration-300 group-hover:border-brand-blue/30">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="services-process">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-blue/15 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead
                overline="How we work"
                title="The same discipline, every engagement."
                description="Whether it is a small web build or a multi-year product partnership, the foundational approach never changes."
              />
              <Reveal delay={0.3}>
                <div className="mt-10 overflow-hidden rounded-3xl border border-white/10">
                  <img src={IMAGES.datacenter} alt="Infrastructure and engineering" className="h-64 w-full object-cover" />
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              {PROCESS.map((step, i) => (
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

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="services-staffing">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <SectionHead
            dark={false}
            overline="Resource services"
            title="Technology talent, without the overhead."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl bg-brand-ink p-10 text-white md:p-12" data-testid="staff-augmentation-card">
                <Users className="h-10 w-10 text-brand-orange" strokeWidth={1.5} />
                <h3 className="mt-8 font-display text-2xl md:text-3xl font-bold tracking-tight">Staff Augmentation</h3>
                <p className="mt-4 leading-relaxed text-white/55">
                  Experienced engineers, designers, and product managers who embed directly into your
                  team and work under your direction — full-time OrynticLabs members, vetted and backed
                  by our technical leadership.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {["Frontend & Backend", "Full-stack", "Mobile", "AI/ML", "UI/UX", "QA", "DevOps", "Product"].map((r) => (
                    <span key={r} className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/70">{r}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="h-full rounded-3xl border border-black/10 bg-white p-10 md:p-12" data-testid="consulting-card">
                <Compass className="h-10 w-10 text-brand-blue" strokeWidth={1.5} />
                <h3 className="mt-8 font-display text-2xl md:text-3xl font-bold tracking-tight">Technology Consulting</h3>
                <p className="mt-4 leading-relaxed text-black/55">
                  Advisory work for founders, CTOs, and heads of product — architecture evaluation,
                  migration planning, vendor assessment, and technology roadmaps. Structured, time-bound,
                  and outcome-focused. We never bill indefinitely for advice.
                </p>
                <div className="mt-10">
                  <ArrowLink to="/contact-us" variant="blue">Book a consultation</ArrowLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
