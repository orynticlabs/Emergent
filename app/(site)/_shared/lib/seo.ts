import type { Metadata } from "next";

// Real domain — CONTACT.website in data/content.js confirms www.orynticlabs.com.
export const SITE_URL = "https://www.orynticlabs.com";
export const SITE_NAME = "OrynticLabs";

// Placeholder — data/content.js's IMAGES are stock photos (already flagged
// elsewhere in this repo as placeholders). Swap for a real 1200x630 branded
// OG image when one exists; every page's social preview uses this fallback
// unless it passes its own `image`.
export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1534312527009-56c7016453e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxmdXR1cmlzdGljJTIwYWJzdHJhY3QlMjBibHVlJTIwb3JhbmdlJTIwZ2xvd2luZ3xlbnwwfHx8fDE3ODczNzY5NTN8MA&ixlib=rb-4.1.0&q=85";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/about". Used for the canonical URL + OG url. */
  path: string;
  image?: string;
  /** Set for hard "do not index" pages (none currently — kept for completeness). */
  noindex?: boolean;
}

/**
 * Builds a complete, self-contained Metadata object for one marketing page —
 * canonical URL, Open Graph (Facebook/WhatsApp/LinkedIn all read OG tags),
 * Twitter Card, and Googlebot-specific directives. Next.js does NOT deep-merge
 * nested `openGraph`/`twitter` objects between a page and its layout, so each
 * page must supply the full object — this helper does that consistently.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
