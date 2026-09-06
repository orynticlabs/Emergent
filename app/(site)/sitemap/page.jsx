import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero, Reveal } from "@site/components/site/Reveal";
import { NAV_LINKS, SERVICES, PRODUCTS, INDUSTRIES } from "@site/data/content";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sitemap",
  description: "Every page on the OrynticLabs site, organized by section.",
  path: "/sitemap",
  noindex: true,
});

const GROUPS = [
  { title: "Pages", links: NAV_LINKS.map((l) => ({ label: l.label, url: l.to })) },
  { title: "Services", links: SERVICES.map((s) => ({ label: s.title, url: "/services" })) },
  { title: "Products", links: PRODUCTS.map((p) => ({ label: p.name, url: "/products" })) },
  { title: "Industries", links: INDUSTRIES.map((i) => ({ label: i.name, url: "/industries" })) },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", url: "/privacy-policy" },
      { label: "Terms & Conditions", url: "/terms-conditions" },
      { label: "Terms of Service", url: "/terms-of-service" },
    ],
  },
];

export default function Sitemap() {
  return (
    <main data-testid="sitemap-page">
      <PageHero
        overline="Navigation"
        lines={["SITE", "MAP."]}
        accentIndex={1}
        description="Every page and destination on the OrynticLabs website, in one place."
      />
      <section className="bg-brand-ink py-20 text-white md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
          {GROUPS.map((group, gi) => (
            <Reveal key={group.title} delay={0.06 * gi}>
              <div data-testid={`sitemap-group-${group.title.toLowerCase()}`}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">{group.title}</p>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.url} className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-300 hover:text-brand-orange">
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
