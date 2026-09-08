"use client";

import { PRODUCTS } from "@site/data/content";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import { PinContainer } from "@site/components/ui/3d-pin";

/**
 * One product's pin card. A dedicated function (not inline JSX in the
 * .map()) so every card renders through the exact same markup/classes -
 * the image block below is deliberately a fixed h-32/w-full box with
 * object-cover on every card, so OryAI/OryCMS/PerformX all show their
 * product image at the identical size regardless of the source image's
 * own aspect ratio (same treatment /products page uses for each
 * product's image under its feature list).
 *
 * A product with a `logo` (currently just PerformX) shows that logo image
 * in place of the plain-text name - sized to the same line-height the text
 * title occupied (h-6) with `object-contain` so the logo's own aspect
 * ratio is preserved rather than stretched/cropped.
 */
function ProductPinCard({ product }) {
  return (
    <PinContainer
      title={product.siteUrl || `orynticlabs.com/products/${product.id}`}
      href="/products"
    >
      <div className="flex h-[20rem] w-[20rem] basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2">
        {product.logo ? (
          <img
            src={product.logo}
            alt={`${product.name} logo`}
            className="!m-0 !mb-2 h-6 w-auto max-w-[10rem] object-contain object-left"
            draggable={false}
          />
        ) : (
          <h3 className="!m-0 max-w-xs !pb-2 text-base font-bold text-slate-100">{product.name}</h3>
        )}
        <div className="!m-0 !p-0 text-base font-normal">
          <span className="text-slate-400">{product.tagline}</span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400/80">
          {product.description}
        </p>
        <div className="mt-4 flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/50 p-1.5">
          <img
            src={product.image}
            alt={`${product.name} visual`}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        </div>
      </div>
    </PinContainer>
  );
}

export default function InternalProjectsSection() {
  return (
    <section
      data-testid="home-internal-projects"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <SectionHead
            titleClassName="text-2xl md:text-5xl uppercase"
            wrapperClassName="max-w-4xl"
            title={
              <>
                Products we run ourselves,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">before we ever sell them.</span>
              </>
            }
            description="OryAI, OryCMS, and PerformX aren't case studies - they're the systems our own team depends on every day."
          />
        </Reveal>

        <div className="mt-16 flex flex-wrap items-start justify-center gap-x-6 gap-y-24">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.id} delay={0.08 * i}>
              <ProductPinCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
