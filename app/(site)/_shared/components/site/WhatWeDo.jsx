"use client";

import Link from "next/link";
import { ArrowUpRight, Compass, Layers, BrainCircuit, Cloud, Sparkles } from "lucide-react";
import { SERVICE_GROUPS, HOME_STATS } from "@site/data/content";
import { Reveal, SectionHead, CountUp } from "@site/components/site/Reveal";
import SpotlightCard from "@site/components/site/SpotlightCard";

const ICONS = { Compass, Layers, BrainCircuit, Cloud };

function FeatureTile() {
  const stat = HOME_STATS[0];
  return (
    <SpotlightCard tint="0,102,255" className="flex flex-col justify-between p-8 md:p-10">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-blue">
          <Sparkles className="h-3.5 w-3.5" /> How we work
        </span>
        <h3 className="mt-6 font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
          One team owns it, start to finish -{" "}
          <span className="text-brand-orange">not five vendors passing the blame.</span>
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55">
          Strategy, engineering, AI, data, cloud, and design all sit under one roof here. When
          something breaks or a decision needs to be made fast, there's one team that already
          knows the whole system - not a ticket routed between three different companies.
        </p>
      </div>
      <div className="mt-10 flex items-end gap-3">
        <CountUp
          value={stat.value}
          className="font-display text-5xl font-black tracking-tighter text-brand-blue"
        />
        <span className="pb-1 text-xs font-medium uppercase tracking-wide text-white/50">
          {stat.label}
        </span>
      </div>
    </SpotlightCard>
  );
}

function ServiceTile({ group }) {
  const Icon = ICONS[group.icon];
  return (
    <SpotlightCard className="p-7">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5">
        <Icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
      </div>
      <h3 className="mt-6 font-display text-lg font-bold tracking-tight">{group.title}</h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-white/55">{group.text}</p>
      <Link
        href={group.href}
        className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/70 transition-colors duration-300 group-hover:text-brand-orange"
      >
        {group.link}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </SpotlightCard>
  );
}

export default function WhatWeDo() {
  return (
    <section
      data-testid="home-what-we-do"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-brand-orange/10 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          titleClassName="text-2xl md:text-5xl uppercase"
          wrapperClassName="max-w-4xl"
          title={
            <>
              Eight practices under one roof.
              <br className="hidden sm:block" />
              <span className="text-brand-orange">One team ships all of it.</span>
            </>
          }
          description="Strategy, engineering, AI, data, and infrastructure - the same people who scope your project in week one are still on it the day it goes live."
        />
        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <FeatureTile />
          </Reveal>
          <Reveal delay={0.08}>
            <ServiceTile group={SERVICE_GROUPS[0]} />
          </Reveal>
          {SERVICE_GROUPS.slice(1).map((group, i) => (
            <Reveal key={group.title} delay={0.08 * (i + 2)}>
              <ServiceTile group={group} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
