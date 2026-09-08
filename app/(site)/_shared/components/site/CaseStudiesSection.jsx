"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCaseStudies } from "@site/hooks/use-case-studies";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import {
  Carousel,
  CarouselArrows,
  Card,
  useCarouselControls,
} from "@site/components/ui/apple-cards-carousel";

function CaseStudyContent({ project }) {
  return (
    <div>
      <p className="text-base leading-relaxed text-white/65">{project.desc}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 px-3.5 py-1 text-xs font-medium text-white/60">
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-white/40">Industry - {project.industry}</p>
      <Link
        href="/contact-us"
        className="group mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange"
      >
        Discuss a similar project
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}

export default function CaseStudiesSection() {
  const { caseStudies } = useCaseStudies();
  const { trackRef, canScrollLeft, canScrollRight, checkScrollability, scrollLeft, scrollRight } =
    useCarouselControls();

  if (caseStudies.length === 0) return null;

  const items = caseStudies.map((project, index) => (
    <Card
      key={project.slug}
      index={index}
      card={{
        category: project.category,
        title: project.title,
        src: project.image,
        content: <CaseStudyContent project={project} />,
      }}
    />
  ));

  return (
    <section
      data-testid="home-case-studies"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHead
              titleClassName="text-2xl md:text-5xl uppercase"
              wrapperClassName="max-w-4xl"
              title={
                <>
                  Case studies from
                  <br className="hidden sm:block" />
                  <span className="text-brand-orange">real engagements.</span>
                </>
              }
              description="A sample of what we've shipped - click a card for the full picture."
            />
          </Reveal>
          <CarouselArrows
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            scrollLeft={scrollLeft}
            scrollRight={scrollRight}
          />
        </div>

        <div className="mt-4 -mx-6 md:-mx-10">
          <div className="px-6 md:px-10">
            <Carousel items={items} trackRef={trackRef} onScroll={checkScrollability} />
          </div>
        </div>

        <Reveal delay={0.15}>
          <Link
            href="/portfolio"
            className="group mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors duration-300 hover:text-brand-orange"
          >
            View full portfolio
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
