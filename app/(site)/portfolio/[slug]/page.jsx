import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { listActiveOryCMSCaseStudies } from "@/case-studies";
import { Reveal, SectionHead, ArrowLink, CountUp } from "@site/components/site/Reveal";
import { buildPageMetadata } from "@site/lib/seo";

/*
 * Case-study read page - structure informed by 21st.dev's "Bold Stats" pattern
 * (headline metric + supporting row of key figures) for the results section;
 * literal source wasn't retrievable (daily retrieval limit), so this is built
 * from the pattern, not copied code.
 *
 * Data comes live from OryCMS (orycms_case_studies), so this page always
 * needs a fresh read rather than the statically-generated params Next.js
 * would otherwise cache from build time.
 */
export const dynamic = "force-dynamic";

function toProject(record) {
  return { ...record, image: record.imageUrl, desc: record.description };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const caseStudies = await listActiveOryCMSCaseStudies();
  const project = caseStudies.find((p) => p.slug === slug);
  if (!project) return {};
  return buildPageMetadata({
    title: `${project.title} - Case Study`,
    description: project.description,
    path: `/portfolio/${project.slug}`,
    image: project.imageUrl,
  });
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const caseStudies = (await listActiveOryCMSCaseStudies()).map(toProject);
  const index = caseStudies.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = caseStudies[index];
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <main data-testid="case-study-page">
      <section className="relative overflow-hidden bg-brand-ink pb-16 pt-40 text-white md:pt-48">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <img src={project.image} alt="" className="h-full w-full object-cover opacity-40 blur-2xl" />
          <div className="absolute inset-0 bg-brand-ink/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/40 via-brand-ink/70 to-brand-ink" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 md:px-10">
          <Reveal>
            <Link
              href="/portfolio"
              data-testid="case-study-back-link"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-300 hover:text-brand-orange"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All case studies
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-orange">
              {project.category}
            </span>
          </Reveal>

          <Reveal delay={0.14}>
            <h1 className="mt-6 font-display text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">{project.title}</h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">{project.desc}</p>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4" data-testid="case-study-meta">
              {[
                { label: "Industry", value: project.industry },
                { label: "Client", value: project.client },
                { label: "Timeline", value: project.timeline },
                { label: "Category", value: project.category },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">{m.label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-ink pb-20" data-testid="case-study-hero-image">
        <Reveal>
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <img src={project.image} alt={project.title} className="h-[22rem] w-full object-cover md:h-[32rem]" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="case-study-challenge">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">The challenge</p>
              <p className="mt-5 text-xl leading-relaxed text-white/80 md:text-2xl">{project.challenge}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Stack used</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32" data-testid="case-study-approach">
        <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-brand-blue/15 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 md:px-10">
          <SectionHead overline="How we approached it" title="What we actually built." wrapperClassName="max-w-2xl" />
          <div className="mt-14">
            {project.approach.map((step, i) => (
              <Reveal key={i} delay={0.07 * i}>
                <div className="group grid gap-4 border-b border-white/10 py-8 transition-colors duration-300 hover:border-brand-blue/40 md:grid-cols-12">
                  <span className="font-display text-4xl font-black tracking-tighter text-outline-light md:col-span-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base leading-relaxed text-white/65 md:col-span-10 md:text-lg">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="case-study-results">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <SectionHead overline="Outcome" title="Where it landed." wrapperClassName="max-w-2xl" />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {project.results.map((r, i) => (
              <Reveal key={r.label} delay={0.08 * i}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                  {/\d/.test(r.value) ? (
                    <CountUp value={r.value} className="font-display text-3xl font-black tracking-tighter text-brand-orange md:text-4xl" />
                  ) : (
                    <p className="font-display text-3xl font-black tracking-tighter text-brand-orange md:text-4xl">{r.value}</p>
                  )}
                  <p className="mt-2 text-sm font-medium text-white/55">{r.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-16 text-white" data-testid="case-study-next">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal>
            <Link
              href={`/portfolio/${next.slug}`}
              data-testid="case-study-next-link"
              className="group flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-brand-orange/50 sm:flex-row sm:items-center md:p-10"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Next case study</p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">{next.title}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition-all duration-300 group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-ink py-24 text-white md:py-32" data-testid="case-study-cta">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <SectionHead
            align="center"
            wrapperClassName="max-w-2xl"
            overline="Building something similar?"
            title="Let's talk about your project."
          />
          <div className="mt-8 flex justify-center">
            <ArrowLink to="/contact-us" variant="blue">Discuss a similar project</ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
