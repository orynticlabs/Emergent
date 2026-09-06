"use client";

import { HeroParallax } from "@site/components/ui/hero-parallax";

/*
 * Own work only — no third-party product screenshots. Sourced from
 * public/ourwork/, each linking to the most relevant internal page.
 */
const OUR_WORK = [
  { title: "Foodie App", link: "/services/mobile-development", thumbnail: "/ourwork/foodie-app.jpg" },
  { title: "Medico — Doctor Consultation App", link: "/services/mobile-development", thumbnail: "/ourwork/medico-app.png" },
  { title: "SaaS Product Landing Page", link: "/portfolio", thumbnail: "/ourwork/saas-landing.png" },
  { title: "Vision — Analytics Dashboard", link: "/products", thumbnail: "/ourwork/vision-dashboard-1.png" },
  { title: "Vision — Dashboard Components", link: "/products", thumbnail: "/ourwork/vision-dashboard-2.png" },
  { title: "E-Commerce Storefront", link: "/portfolio", thumbnail: "/ourwork/ecommerce-storefront.png" },
  { title: "Adhunik Crop Care — Agri Platform", link: "/industries", thumbnail: "/ourwork/adhunik-crop-care.png" },
];

// The parallax lays out 3 rows of 5 (15 cards). Only 7 real screenshots
// exist today, so the list repeats to fill every row instead of leaving
// the 2nd/3rd rows sparse or empty — each repeat gets a distinct `id` so
// keys stay unique even though the same image shows more than once.
const ROW_CARD_COUNT = 15;
const PRODUCTS = Array.from({ length: ROW_CARD_COUNT }, (_, i) => ({
  ...OUR_WORK[i % OUR_WORK.length],
  id: i,
}));

export default function HeroParallaxSection() {
  return (
    <div data-testid="hero-parallax-section" className="bg-brand-ink">
      <HeroParallax products={PRODUCTS} />
    </div>
  );
}
