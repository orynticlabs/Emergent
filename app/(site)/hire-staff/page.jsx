import { IMAGES, CONTACT } from "@site/data/content";
import { buildPageMetadata, SITE_URL } from "@site/lib/seo";
import HireStaffClient from "./HireStaffClient";
import { HIRE_STAFF_FAQS } from "./hire-staff-data";

export const metadata = buildPageMetadata({
  title: "Hire Staff | Hire Vetted Developers & Engineers On Demand",
  description:
    "Hire pre-vetted software engineers, mobile developers, AI/ML specialists, and DevOps engineers on flexible terms — staff augmentation, dedicated teams, or project-based hiring. Shortlist in 48 hours, full IP ownership, no long-term lock-in.",
  path: "/hire-staff",
  image: IMAGES.culture,
});

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Staff Augmentation & Dedicated Engineering Teams",
  name: "Hire Staff — OrynticLabs",
  description:
    "Hire pre-vetted software engineers, mobile developers, AI/ML specialists, and DevOps engineers on flexible staff augmentation, dedicated team, or project-based terms.",
  url: `${SITE_URL}/hire-staff`,
  areaServed: "Worldwide",
  provider: {
    "@type": "Organization",
    name: "OrynticLabs",
    url: SITE_URL,
    email: CONTACT.general,
    telephone: CONTACT.phone,
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HIRE_STAFF_FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function HireStaffPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <HireStaffClient />
    </>
  );
}
