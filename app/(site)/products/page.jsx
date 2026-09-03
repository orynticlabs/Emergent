import { PRODUCTS } from "@site/data/content";
import { PageHero, Reveal, Overline, ArrowLink } from "@site/components/site/Reveal";
import { Check } from "lucide-react";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Products",
  description:
    "Our proprietary product suite — used internally, offered to clients as part of engagements, and in some cases available as standalone products.",
  path: "/products",
});

function ProductBlock({ product, index, flip }) {
  const dark = product.theme === "dark";
  return (
    <section
      data-testid={`product-section-${product.id}`}
      className={`relative overflow-hidden py-24 md:py-32 ${dark ? "bg-brand-ink text-white" : "bg-brand-paper text-brand-coal"}`}
    >
      {dark && (
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-orange/10 blur-[130px]" aria-hidden="true" />
      )}
      <div className={`relative mx-auto grid max-w-7xl items-center gap-14 px-6 md:px-10 lg:grid-cols-2`}>
        <div className={flip ? "lg:order-2" : ""}>
          <Reveal>
            <Overline color={dark ? "orange" : "blue"}>Product 0{index + 1}</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-4xl md:text-6xl font-black tracking-tighter">{product.name}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={`mt-2 text-lg font-medium ${dark ? "text-brand-orange" : "text-brand-blue"}`}>{product.tagline}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={`mt-6 leading-relaxed ${dark ? "text-white/60" : "text-black/60"}`}>{product.description}</p>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {product.features.map((f, i) => (
              <Reveal key={f} delay={0.05 * i}>
                <div className="flex items-start gap-3">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-brand-orange" : "text-brand-blue"}`} strokeWidth={2.5} />
                  <p className={`text-sm leading-relaxed ${dark ? "text-white/70" : "text-black/70"}`}>{f}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.15} className={flip ? "lg:order-1" : ""}>
          <div className={`overflow-hidden rounded-3xl border ${dark ? "border-white/10 glow-orange" : "border-black/10 shadow-2xl shadow-black/10"}`}>
            <img src={product.image} alt={`${product.name} product visual`} className="h-80 w-full object-cover md:h-[30rem]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Products() {
  return (
    <main data-testid="products-page">
      <PageHero
        overline="Internal products"
        lines={["PRODUCTS", "BUILT FOR", "SCALE."]}
        accentIndex={2}
        description="Used internally, offered to clients as part of engagements, and in some cases available as standalone products."
      />
      {PRODUCTS.map((p, i) => (
        <ProductBlock key={p.id} product={p} index={i} flip={i % 2 === 1} />
      ))}
      <section className="bg-brand-ink py-24 text-center text-white md:py-32" data-testid="products-cta">
        <Reveal>
          <h2 className="mx-auto max-w-3xl px-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Want one of these running inside <span className="text-brand-orange">your</span> business?
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10">
            <ArrowLink to="/contact-us">Talk to us</ArrowLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
