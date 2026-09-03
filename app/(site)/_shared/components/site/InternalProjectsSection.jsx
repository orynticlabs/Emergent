"use client";

import { useEffect, useState } from "react";
import { PRODUCTS } from "@site/data/content";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import { PinContainer } from "@site/components/ui/3d-pin";

/**
 * One product's pin card. A dedicated function (not inline JSX in the
 * .map()) so every card renders through the exact same markup/classes —
 * the image block below is deliberately a fixed h-32/w-full box with
 * object-cover on every card, so OryAI/OryCMS/PerformX all show their
 * product image at the identical size regardless of the source image's
 * own aspect ratio (same treatment /products page uses for each
 * product's image under its feature list).
 *
 * `image` is whatever InternalProjectsSection resolved for this product —
 * an OryCMS-uploaded URL (Settings → Product images) when one exists,
 * otherwise the static fallback photo from content.js.
 */
function ProductPinCard({ product, image }) {
  return (
    <PinContainer title={`orynticlabs.com/products/${product.id}`} href="/products">
      <div className="flex h-[20rem] w-[20rem] basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2">
        <h3 className="!m-0 max-w-xs !pb-2 text-base font-bold text-slate-100">{product.name}</h3>
        <div className="!m-0 !p-0 text-base font-normal">
          <span className="text-slate-400">{product.tagline}</span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400/80">
          {product.description}
        </p>
        <div className="mt-4 h-32 w-full shrink-0 overflow-hidden rounded-lg border border-white/10">
          <img
            src={image}
            alt={`${product.name} logo`}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </PinContainer>
  );
}

export default function InternalProjectsSection() {
  // OryCMS-uploaded images (Settings → Product images) override the static
  // content.js photos for whichever products have one set. Fetched
  // client-side from a public, unauthenticated endpoint — no session exists
  // on the marketing site — and falls back to the static image untouched
  // when the fetch fails or a given product has no upload yet.
  const [uploadedImages, setUploadedImages] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orycms/settings/product-images/public", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Product images fetch failed: ${res.status}`);
        return res.json();
      })
      .then((body) => {
        if (cancelled || !body?.success || !body.data) return;
        setUploadedImages(body.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      data-testid="home-internal-projects"
      className="bg-grid-dark relative overflow-hidden bg-brand-ink py-24 text-white md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <SectionHead
            titleClassName="text-2xl md:text-7xl uppercase"
            wrapperClassName="max-w-4xl"
            title={
              <>
                Products we run ourselves,
                <br className="hidden sm:block" />
                <span className="text-brand-orange">before we ever sell them.</span>
              </>
            }
            description="OryAI, OryCMS, and PerformX aren't case studies — they're the systems our own team depends on every day."
          />
        </Reveal>

        <div className="mt-16 flex flex-wrap items-start justify-center gap-x-6 gap-y-24">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.id} delay={0.08 * i}>
              <ProductPinCard product={product} image={uploadedImages[product.id] || product.image} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
