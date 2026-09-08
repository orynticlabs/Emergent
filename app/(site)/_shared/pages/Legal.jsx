import { PageHero, Reveal } from "@site/components/site/Reveal";

const CONTENT = {
  "privacy-policy": {
    overline: "Legal",
    lines: ["PRIVACY", "POLICY."],
    accentIndex: 0,
    description: "How Oryntic Labs Private Limited collects, uses, and protects your information.",
    sections: [
      { title: "Information we collect", text: "We collect information you provide directly - such as your name, email address, and project details submitted through our contact and newsletter forms - along with standard technical data like browser type and pages visited." },
      { title: "How we use it", text: "Your information is used solely to respond to enquiries, deliver requested updates, and improve our services. We do not sell, rent, or trade your personal information to third parties." },
      { title: "Data security", text: "We apply industry-standard safeguards including encrypted transport (TLS), access controls, and secure infrastructure practices across all systems we operate." },
      { title: "Your rights", text: "You may request access to, correction of, or deletion of your personal data at any time by writing to hello@orynticlabs.com." },
      { title: "Updates", text: "This policy may be updated as our services evolve. Material changes will be noted on this page. This is a template policy - the final version should be reviewed by legal counsel before publication." },
    ],
  },
  "terms-conditions": {
    overline: "Legal",
    lines: ["TERMS &", "CONDITIONS."],
    accentIndex: 1,
    description: "The terms governing use of the Oryntic Labs website and engagement with our services.",
    sections: [
      { title: "Use of this website", text: "Content on this website is provided for general information about Oryntic Labs Private Limited and its services. It does not constitute a binding offer, proposal, or professional advice." },
      { title: "Engagements", text: "All project work is governed by a documented scope of work and a separately executed agreement between Oryntic Labs and the client. Website content does not override those agreements." },
      { title: "Intellectual property", text: "All content, branding, and product names on this site - including OryAI, OryCMS, and PerformX - are the property of Oryntic Labs Private Limited unless stated otherwise." },
      { title: "Limitation of liability", text: "Oryntic Labs is not liable for indirect or consequential damages arising from use of this website or reliance on its content." },
      { title: "Updates", text: "These terms may be revised periodically. This is a template document - the final version should be reviewed by legal counsel before publication." },
    ],
  },
  "terms-of-service": {
    overline: "Legal",
    lines: ["TERMS OF", "SERVICE."],
    accentIndex: 1,
    description: "Service-level terms for Oryntic Labs platforms and products, including OryAI, OryCMS, and PerformX.",
    sections: [
      { title: "Service provision", text: "Access to Oryntic Labs products and platforms is provided under the commercial terms agreed in each engagement - SaaS subscription, PaaS licensing, or custom project agreements." },
      { title: "Acceptable use", text: "Users agree not to misuse our platforms - including attempting unauthorized access, disrupting service availability, or using the products for unlawful purposes." },
      { title: "Availability & support", text: "Support and service-level commitments, where applicable, are defined per engagement. We communicate honestly and early if timelines or availability are affected." },
      { title: "Termination", text: "Either party may end a service relationship per the notice terms in the governing agreement. Data export assistance is provided on request." },
      { title: "Updates", text: "These terms may be revised periodically. This is a template document - the final version should be reviewed by legal counsel before publication." },
    ],
  },
};

export default function Legal({ kind }) {
  const page = CONTENT[kind];
  return (
    <main data-testid={`legal-page-${kind}`}>
      <PageHero overline={page.overline} lines={page.lines} accentIndex={page.accentIndex} description={page.description} />
      <section className="bg-brand-ink py-20 text-white md:py-28">
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          {page.sections.map((s, i) => (
            <Reveal key={s.title} delay={0.05 * i}>
              <div className="border-b border-white/10 py-8">
                <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                  <span className="mr-3 text-sm text-brand-orange">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <p className="mt-3 leading-relaxed text-white/60">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
