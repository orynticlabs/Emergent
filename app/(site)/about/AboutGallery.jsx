"use client";

import { useCaseStudies } from "@site/hooks/use-case-studies";
import { SectionHead } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";
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

const SLOT_CLASSES = ["md:col-span-2 h-64 md:h-80", "col-span-1 h-64 md:h-80", "col-span-1 h-64 md:h-80", "md:col-span-2 h-64 md:h-80"];

export default function AboutGallery() {
  const { caseStudies } = useCaseStudies();
  const galleryProjects = caseStudies.slice(0, 4);

  if (galleryProjects.length === 0) return null;

  const cards = galleryProjects.map((p, i) => ({
    id: p.id,
    className: SLOT_CLASSES[i],
    thumbnail: p.image,
    content: <CardCaption title={p.title} category={p.category} desc={p.desc} />,
  }));

  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-gallery">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          align="center"
          titleClassName="text-2xl md:text-7xl uppercase"
          wrapperClassName="mx-auto max-w-4xl"
          title={
            <>
              A few things
              <br />
              <CanvasText
                text="we've shipped"
                className="font-display text-2xl font-black uppercase md:text-7xl"
                colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
                lineGap={6}
                animationDuration={10}
              />
            </>
          }
          description="Click a project to read more about it. The full case study list lives on our portfolio page."
        />
      </div>
      <div className="mt-14 px-6 md:px-10">
        <LayoutGrid cards={cards} />
      </div>
    </section>
  );
}
