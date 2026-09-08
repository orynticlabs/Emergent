"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import {
  siNextdotjs, siReact, siTypescript, siTailwindcss, siNodedotjs,
  siPython, siPostgresql, siMongodb, siDocker, siKubernetes,
} from "simple-icons";
import { cn } from "@site/lib/utils";
import { IMAGES } from "@site/data/content";
import { useCaseStudies } from "@site/hooks/use-case-studies";
import { WorldMap } from "@site/components/ui/world-map";
import { SectionHead } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";

// Real brand marks (via simple-icons), not plain-text name chips - a
// representative, recognizable slice of the full stack on /stack, spanning
// frontend, backend, data, and infra rather than an arbitrary sample.
const TECH_LOGOS = [
  siNextdotjs, siReact, siTypescript, siTailwindcss, siNodedotjs,
  siPython, siPostgresql, siMongodb, siDocker, siKubernetes,
];

const OFFICE_ROUTES = [
  { start: { lat: 24.5362, lng: 81.2961 }, end: { lat: 28.4595, lng: 77.0266 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: 51.5074, lng: -0.1278 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: 1.3521, lng: 103.8198 } },
];

const FeatureCard = ({ children, className }) => (
  <div className={cn("relative overflow-hidden p-4 sm:p-8", className)}>{children}</div>
);

const FeatureTitle = ({ children }) => (
  <p className="mx-auto max-w-5xl text-left font-display text-xl tracking-tight text-white md:text-2xl md:leading-snug">
    {children}
  </p>
);

const FeatureDescription = ({ children }) => (
  <p className="mx-0 my-2 max-w-sm text-left text-sm font-normal text-white/50 md:text-base">{children}</p>
);

function SkeletonStack() {
  return (
    <div className="relative flex h-full gap-10 px-2 py-8">
      <div className="group mx-auto h-full w-full bg-white/5 p-5 shadow-2xl">
        <img
          src={IMAGES.dashboard}
          alt="Oryntic Labs product interface"
          loading="lazy"
          decoding="async"
          className="aspect-square h-full w-full rounded-sm object-cover object-left-top"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-60 w-full bg-gradient-to-t from-brand-ink via-brand-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-60 w-full bg-gradient-to-b from-brand-ink via-transparent to-transparent" />
    </div>
  );
}

function SkeletonTechStack() {
  const rowA = TECH_LOGOS.slice(0, 5);
  const rowB = TECH_LOGOS.slice(5, 10);
  const chip = (icon, idx) => (
    <motion.div
      key={icon.slug}
      whileHover={{ scale: 1.12, zIndex: 10 }}
      style={{ rotate: ((idx * 37) % 20) - 10 }}
      title={icon.title}
      className="-mr-3 mt-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-md"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={`#${icon.hex}`} role="img" aria-label={icon.title}>
        <path d={icon.path} />
      </svg>
    </motion.div>
  );

  return (
    <div className="relative flex h-full flex-col items-start justify-center gap-6 overflow-hidden p-6">
      <img
        src={IMAGES.tech}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-brand-ink/40" aria-hidden="true" />
      <div className="relative -ml-16 flex flex-row">{rowA.map(chip)}</div>
      <div className="relative flex flex-row">{rowB.map(chip)}</div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[100] h-full w-16 bg-gradient-to-r from-brand-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[100] h-full w-16 bg-gradient-to-l from-brand-ink to-transparent" />
    </div>
  );
}

function SkeletonPortfolio({ project }) {
  return (
    <Link href="/portfolio" className="group/image relative flex h-full gap-10">
      <div className="group mx-auto h-full w-full bg-transparent">
        <div className="relative flex h-full w-full flex-1 flex-col space-y-2">
          <Play className="absolute inset-0 z-10 m-auto h-14 w-14 text-brand-orange" fill="currentColor" strokeWidth={0} />
          {project && (
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="aspect-square h-full w-full rounded-sm object-cover object-center blur-none transition-all duration-200 group-hover/image:blur-md"
            />
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonGlobe() {
  return (
    <div className="relative mt-4 flex h-56 flex-col items-center bg-transparent md:h-60">
      <WorldMap dots={OFFICE_ROUTES} lineColor="#0066FF" />
    </div>
  );
}

export default function AboutFeatures() {
  const { caseStudies } = useCaseStudies();
  const featuredProject = caseStudies[0] ?? null;

  const features = [
    {
      title: "One accountable team, not fragmented vendors",
      description: "Web, mobile, AI, data, and cloud, delivered by engineers who talk to each other.",
      skeleton: <SkeletonStack />,
      className: "col-span-1 lg:col-span-4 border-b lg:border-r border-white/10",
    },
    {
      title: "100+ technologies in our stack",
      description: "We pick the right tool for the problem, not the one we already know.",
      skeleton: <SkeletonTechStack />,
      className: "border-b col-span-1 lg:col-span-2 border-white/10",
    },
    {
      title: "See the work, not just the pitch",
      description: "Real projects we've shipped - click through to the full portfolio.",
      skeleton: <SkeletonPortfolio project={featuredProject} />,
      className: "col-span-1 lg:col-span-3 lg:border-r border-white/10",
    },
    {
      title: "Delivering across time zones",
      description: "Based in Gurugram and Rewa, working with clients well beyond either.",
      skeleton: <SkeletonGlobe />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none border-white/10",
    },
  ];

  return (
    <section className="relative z-20 border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-features">
      <div className="mx-auto max-w-7xl">
        <div className="px-8">
          <SectionHead
            align="center"
            titleClassName="text-2xl md:text-7xl uppercase"
            wrapperClassName="max-w-4xl"
            title={
              <>
                Built to do the whole job,
                <br />
                <CanvasText
                  text="not just part of it."
                  className="font-display text-2xl font-black uppercase md:text-7xl"
                  colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
                  lineGap={6}
                  animationDuration={10}
                />
              </>
            }
            description="From product strategy to production infrastructure, one team carries the work through - here's what that actually looks like."
          />
        </div>

        <div className="relative">
          <div className="mt-12 grid grid-cols-1 rounded-md lg:grid-cols-6 xl:border xl:border-white/10">
            {features.map((feature) => (
              <FeatureCard key={feature.title} className={feature.className}>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
                <div className="h-full w-full">{feature.skeleton}</div>
              </FeatureCard>
            ))}
          </div>
          <Link
            href="/portfolio"
            className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-white/60 transition-colors duration-300 hover:text-brand-orange"
          >
            View the full portfolio
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
