"use client";

import { IMAGES } from "@site/data/content";
import { ContainerScroll } from "@site/components/ui/container-scroll-animation";

export default function OryCMSShowcase() {
  return (
    <section data-testid="orycms-showcase" className="bg-brand-ink flex flex-col overflow-hidden text-white">
      <ContainerScroll
        titleComponent={
          <>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">
              Built By Us, Used By You
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-white md:text-[4.5rem]">
              The content platform <br />
              <span className="mt-1 block bg-gradient-to-r from-brand-orange to-brand-blue bg-clip-text font-bold leading-none text-transparent">
                OryCMS
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
              Our own headless CMS - collections, roles, workspaces, and a live admin
              dashboard, running this very site.
            </p>
          </>
        }
      >
        <img
          src={IMAGES.dashboard}
          alt="OryCMS admin dashboard"
          height={720}
          width={1400}
          className="mx-auto h-full rounded-2xl object-cover object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  );
}
