import type { MetadataRoute } from "next";

const SITE_URL = "https://www.orynticlabs.com";

const PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/products", priority: 0.8, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.7, changeFrequency: "weekly" },
  { path: "/industries", priority: 0.7, changeFrequency: "monthly" },
  { path: "/stack", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact-us", priority: 0.7, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
