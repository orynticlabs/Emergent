import { buildPageMetadata, SITE_URL } from "@site/lib/seo";
import { CONTACT, CONTACT_FAQS } from "@site/data/content";
import ContactClient from "./ContactClient";

export const metadata = buildPageMetadata({
  title: "Contact Oryntic Labs | Talk to Our Software & AI Development Team",
  description:
    "Get in touch with Oryntic Labs to discuss web, mobile, AI, or software development for your business. Share your requirements and hear back from our team within 24 hours - no sales queue, no ticket number.",
  path: "/contact-us",
});

const CONTACT_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Oryntic Labs",
  url: `${SITE_URL}/contact-us`,
  about: {
    "@type": "Organization",
    name: "Oryntic Labs",
    url: SITE_URL,
    email: CONTACT.general,
    telephone: CONTACT.phone,
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", email: CONTACT.sales, telephone: CONTACT.phone, areaServed: "Worldwide" },
      { "@type": "ContactPoint", contactType: "customer support", email: CONTACT.support, areaServed: "Worldwide" },
    ],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CONTACT_FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CONTACT_PAGE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <ContactClient />
    </>
  );
}
