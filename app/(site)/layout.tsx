import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./_shared/site.css";
import SiteShell from "./_shared/components/site/SiteShell";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "./_shared/lib/seo";

const DEFAULT_TITLE = "Oryntic Labs - Engineering Intelligent Software";
const DEFAULT_DESCRIPTION =
  "Oryntic Labs - a full-spectrum technology company engineering intelligent software: web, mobile, AI/ML, data, cloud, and design.";

export const metadata: Metadata = {
  // Base URL every relative `alternates.canonical` / OG image path resolves
  // against - required for Next.js to emit absolute canonical/OG URLs.
  metadataBase: new URL(SITE_URL),

  // ── Core <head> tags ──────────────────────────────────────────────────
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Oryntic Labs Private Limited", url: SITE_URL }],
  creator: "Oryntic Labs Private Limited",
  publisher: "Oryntic Labs Private Limited",
  keywords: [
    "Oryntic Labs",
    "software engineering studio",
    "AI engineering",
    "custom software development",
    "web development company",
    "mobile app development",
    "cloud engineering",
    "product design agency",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: "/favicon-oryntic.png",
    apple: "/apple-touch-icon-oryntic.png",
  },

  // ── Google Search / Googlebot controls ───────────────────────────────
  // Per-page `alternates.canonical` and `robots` (see seo.ts) override these
  // defaults; this is just the site-wide fallback.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // ── Open Graph - Facebook / Meta / WhatsApp / LinkedIn all read these ──
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },

  // ── Twitter/X Card (falls back to OG on platforms that don't read it) ──
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Guards against a known browser/extension DataCloneError thrown for
          PerformanceServerTiming entries - harmless, but noisy in the console. */}
      <Script id="datacloneerror-guard" strategy="beforeInteractive">
        {`window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);`}
      </Script>
      <SiteShell>{children}</SiteShell>
    </>
  );
}
