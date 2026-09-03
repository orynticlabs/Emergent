"use client";

import { PROJECTS } from "@site/data/content";
import { SectionHead } from "@site/components/site/Reveal";
import { LayoutGrid } from "@site/components/ui/layout-grid";

function CardCaption({ title, category, desc }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">{category}</p>
      <p className="mt-2 font-display text-xl font-bold text-white md:text-3xl">{title}</p>
      <p className="mt-3 max-w-lg text-sm text-white/70 md:text-base">{desc}</p>
    </div>
  );
}

const GALLERY_PROJECTS = [PROJECTS[1], PROJECTS[2], PROJECTS[3], PROJECTS[5]];

const CARDS = [
  { id: 1, className: "md:col-span-2 h-64 md:h-80" },
  { id: 2, className: "col-span-1 h-64 md:h-80" },
  { id: 3, className: "col-span-1 h-64 md:h-80" },
  { id: 4, className: "md:col-span-2 h-64 md:h-80" },
].map((slot, i) => {
  const p = GALLERY_PROJECTS[i];
  return {
    ...slot,
    thumbnail: p.image,
    content: <CardCaption title={p.title} category={p.category} desc={p.desc} />,
  };
});

export default function AboutGallery() {
  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-gallery">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          align="center"
          titleClassName="text-2xl md:text-7xl uppercase"
          wrapperClassName="mx-auto max-w-4xl"
          title="A few things we've shipped"
          description="Click a project to read more about it. The full case study list lives on our portfolio page."
        />
      </div>
      <div className="mt-14 px-6 md:px-10">
        <LayoutGrid cards={CARDS} />
      </div>
    </section>
  );
}
