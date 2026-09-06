import type { MetadataRoute } from "next";

const SITE_URL = "https://www.orynticlabs.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The OryCMS admin panel lives on this same domain — keep it out of
        // crawling entirely (the /admin/* pages also carry robots:noindex
        // as a second layer, but disallowing here stops crawl budget being
        // spent on it in the first place).
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
