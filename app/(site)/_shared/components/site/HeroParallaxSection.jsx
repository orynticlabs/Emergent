"use client";

import { IMAGES } from "@site/data/content";
import { HeroParallax } from "@site/components/ui/hero-parallax";

/*
 * Own work only — no third-party product screenshots. Real placeholder
 * portfolio projects (same ones on /portfolio) mixed with our own products
 * and site sections, each linking to the real internal page. Swap the
 * portfolio entries for real client work/screenshots when available.
 */
const PRODUCTS = [
  { title: "AI Knowledge Assistant", link: "/portfolio", thumbnail: IMAGES.ai },
  { title: "Fleet Command Center", link: "/portfolio", thumbnail: IMAGES.architecture },
  { title: "Headless Commerce Platform", link: "/portfolio", thumbnail: IMAGES.dashboard },
  { title: "Telemedicine Suite", link: "/portfolio", thumbnail: IMAGES.about },
  { title: "Lending Automation Platform", link: "/portfolio", thumbnail: IMAGES.datacenter },

  { title: "Smart Warehouse System", link: "/portfolio", thumbnail: IMAGES.hero },
  { title: "Learning Experience Platform", link: "/portfolio", thumbnail: IMAGES.culture },
  { title: "EV Charging Network App", link: "/portfolio", thumbnail: IMAGES.ai },
  { title: "OryAI", link: "/products", thumbnail: IMAGES.datacenter },
  { title: "OryCMS", link: "/products", thumbnail: IMAGES.dashboard },

  { title: "PerformX", link: "/products", thumbnail: IMAGES.architecture },
  { title: "Strategic Consulting", link: "/services", thumbnail: IMAGES.culture },
  { title: "Industries We Serve", link: "/industries", thumbnail: IMAGES.hero },
  { title: "Our Technology Stack", link: "/stack", thumbnail: IMAGES.about },
  { title: "Meet OrynticLabs", link: "/about", thumbnail: IMAGES.ai },
];

export default function HeroParallaxSection() {
  return (
    <div data-testid="hero-parallax-section" className="bg-brand-ink">
      <HeroParallax products={PRODUCTS} />
    </div>
  );
}
