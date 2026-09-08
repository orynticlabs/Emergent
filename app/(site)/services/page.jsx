import { SERVICES, IMAGES, CONTACT } from "@site/data/content";
import { buildPageMetadata, SITE_URL } from "@site/lib/seo";
import ServicesClient from "./ServicesClient";

export const metadata = buildPageMetadata({
  title: "Software Development Services | Web, Mobile, AI & Cloud - Oryntic Labs",
  description:
    "Oryntic Labs delivers web development, product development, custom software, mobile apps, AI & machine learning, data & analytics, cloud infrastructure, and UI/UX design - plus staff augmentation and technology consulting. One accountable team, full-spectrum delivery, based in India.",
  path: "/services",
  image: IMAGES.datacenter,
});

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Software Development",
  name: "Oryntic Labs Software Development Services",
  description:
    "Full-spectrum software development services spanning web, product, custom software, mobile, AI/ML, data & analytics, cloud infrastructure, UI/UX design, staff augmentation, and technology consulting.",
  url: `${SITE_URL}/services`,
  areaServed: "Worldwide",
  provider: {
    "@type": "Organization",
    name: "Oryntic Labs",
    url: SITE_URL,
    email: CONTACT.general,
    telephone: CONTACT.phone,
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.blurb,
      },
    })),
  },
};

export default function Services() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />
      <ServicesClient />
    </>
  );
}
