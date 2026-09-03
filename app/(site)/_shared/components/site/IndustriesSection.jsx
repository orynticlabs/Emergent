"use client";

import {
  Landmark,
  HeartPulse,
  GraduationCap,
  Truck,
  Factory,
  Sprout,
  ShoppingBag,
  Zap,
  Building2,
  Car,
  UtensilsCrossed,
} from "lucide-react";
import { INDUSTRIES } from "@site/data/content";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import { HoverEffect } from "@site/components/ui/card-hover-effect";

const ICONS = {
  Fintech: Landmark,
  "Healthcare & Biotech": HeartPulse,
  EdTech: GraduationCap,
  "Supply Chain & Logistics": Truck,
  Manufacturing: Factory,
  Agriculture: Sprout,
  "Retail & E-commerce": ShoppingBag,
  "Energy & Utilities": Zap,
  "Real Estate": Building2,
  Automobile: Car,
  "Hospitality & Food": UtensilsCrossed,
};

export default function IndustriesSection() {
  const items = INDUSTRIES.map((ind) => ({
    title: ind.name,
    description: ind.build,
    link: "/industries",
    icon: ICONS[ind.name],
  }));

  return (
    <section
      data-testid="home-industries"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-[36rem] rounded-full bg-brand-blue/10 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <SectionHead
            titleClassName="text-2xl md:text-7xl uppercase"
            wrapperClassName="max-w-4xl"
            title={
              <>
                Eleven industries.
                <br className="hidden sm:block" />
                <span className="text-brand-orange">Zero copy-paste solutions.</span>
              </>
            }
            description="We spend time understanding how an industry actually operates before we propose anything — that's why what we build for a hospital looks nothing like what we build for a warehouse."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <HoverEffect items={items} className="mt-10" />
        </Reveal>
      </div>
    </section>
  );
}
