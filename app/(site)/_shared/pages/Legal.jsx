"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Calendar, Building2, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Reveal, KineticLine, EASE } from "@site/components/site/Reveal";
import { CONTACT, IMAGES } from "@site/data/content";

const CONTENT = {
  "privacy-policy": {
    overline: "Legal & Compliance",
    titleLine1: "PRIVACY & DATA",
    titleLine2: "PROTECTION POLICY.",
    accentIndex: 1,
    description: "How Oryntic Labs Private Limited collects, uses, and protects your personal data, source code, and commercial specifications.",
    sections: [
      {
        title: "Introduction & Corporate Identity",
        text: "Oryntic Labs Private Limited (CIN: U62011MP2026PTC085165; GSTIN: 23AAFCO2495P1ZX) is an incorporated technology enterprise in India with offices in Gurugram, Haryana and Rewa, Madhya Pradesh. We treat your personal and commercial data with strict technical and organizational safeguards.",
      },
      {
        title: "Information We Collect",
        text: "We collect information you voluntarily provide (name, email, phone, company, software briefs, uploaded RFP documents, and billing data) alongside standard technical diagnostics (IP addresses, browser specs, and session telemetry) to provide our engineering services.",
      },
      {
        title: "How We Use It",
        text: "Your information is used exclusively to evaluate projects, execute Non-Disclosure Agreements (NDAs), develop and maintain software platforms (OryAI, OryCMS, PerformX), issue invoices, and defend against security risks. We never sell, rent, or trade your data.",
      },
      {
        title: "AI & Client IP Isolation Guarantee",
        text: "Client proprietary source code, database architectures, and prompts are NEVER used to train public or commercial foundation AI models without bilateral written agreement. All developed code belongs 100% to the client upon settlement of dues.",
      },
      {
        title: "Data Security & ISO 27001 Standards",
        text: "We apply industry-standard protections including TLS 1.3 encryption in transit, AES-256 encryption at rest, role-based access controls (RBAC), multi-factor authentication, and continuous automated vulnerability scanning.",
      },
      {
        title: "Your Statutory Rights",
        text: "In accordance with India's DPDP Act, 2023 and the GDPR, you may request access to, correction of, or deletion of your personal data at any time by writing to support@orynticlabs.com.",
      },
    ],
  },
  "terms-conditions": {
    overline: "Legal & Terms",
    titleLine1: "TERMS &",
    titleLine2: "CONDITIONS.",
    accentIndex: 1,
    description: "The commercial, operational, and intellectual property terms governing your use of the Oryntic Labs website and related digital services.",
    sections: [
      {
        title: "Introduction & Corporate Entity",
        text: "These Terms and Conditions govern access to and use of the Oryntic Labs website (www.orynticlabs.com) and associated digital interfaces provided by Oryntic Labs Private Limited (CIN: U62011MP2026PTC085165), incorporated under the Indian Companies Act, 2013.",
      },
      {
        title: "Permitted Use & Prohibited Conduct",
        text: "This website is provided for informational and commercial scoping purposes. Users agree not to conduct automated scraping, vulnerability probing, reverse engineering, or intentional disruption of website availability or underlying cloud infrastructure.",
      },
      {
        title: "Intellectual Property Rights",
        text: "All trademarks, website copy, visual assets, brand identities, and product marks—including OryAI, OryCMS, and PerformX—are the proprietary intellectual property of Oryntic Labs Private Limited. Unauthorized duplication, reproduction, or redistribution is strictly prohibited.",
      },
      {
        title: "Client Engagements & Priority of Agreements",
        text: "Website content serves as a high-level informational overview and does not constitute a binding unilateral proposal. All software development, staffing, and technology consulting engagements are formally governed by an executed Master Services Agreement (MSA), Non-Disclosure Agreement (NDA), or Statement of Work (SOW). In the event of a conflict, executed contracts supersede website terms.",
      },
      {
        title: "Confidentiality & NDA Protection",
        text: "We understand that prospective clients share sensitive product visions and architectures. We routinely execute mutual Non-Disclosure Agreements prior to in-depth technical scoping calls. Confidential information shared with our team is safeguarded with strict internal protocols.",
      },
      {
        title: "Third-Party Links & Integrations",
        text: "Our website may link to third-party tools, social platforms, and technical documentation. Oryntic Labs does not control and is not liable for third-party privacy policies, services, or data practices.",
      },
      {
        title: "Disclaimer of Warranties",
        text: "While we strive for absolute accuracy in our documentation, the website and its content are provided on an 'as-is' and 'as-available' basis without warranties of any kind, whether express or implied, regarding commercial fitness or continuous error-free operation.",
      },
      {
        title: "Limitation of Liability",
        text: "To the maximum extent permitted by applicable Indian law, Oryntic Labs Private Limited, its directors, officers, and employees shall not be liable for any indirect, incidental, or consequential damages arising out of your access to or inability to use this website.",
      },
      {
        title: "Governing Law & Jurisdiction",
        text: "These terms are governed by and construed in accordance with the laws of the Republic of India. Any legal action or proceeding arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Madhya Pradesh and Haryana, India.",
      },
      {
        title: "Contact & Legal Notices",
        text: "Official notices and legal inquiries regarding these terms may be addressed to our Legal & Compliance Desk at support@orynticlabs.com or via registered mail to our corporate office.",
      },
    ],
  },
  "terms-of-service": {
    overline: "Service Agreement",
    titleLine1: "TERMS OF",
    titleLine2: "SERVICE.",
    accentIndex: 1,
    description: "Service-level terms, runtime availability, and delivery frameworks for Oryntic Labs platforms (OryAI, OryCMS, PerformX) and custom software projects.",
    sections: [
      {
        title: "Scope & Provision of Services",
        text: "Oryntic Labs provides software engineering, cloud architecture, staff augmentation, and proprietary software access (including OryAI, OryCMS, and PerformX) under SaaS subscriptions, PaaS licensing, or custom milestone-based engineering agreements.",
      },
      {
        title: "Account Security & Credentials",
        text: "Where clients are provisioned administrative accounts or API keys for OryAI, OryCMS, or custom staging environments, the client is responsible for maintaining the strict confidentiality of access credentials and notifying us immediately of any suspected breach.",
      },
      {
        title: "Acceptable Use Policy",
        text: "Clients agree not to utilize our software platforms or APIs for unlawful purposes, malicious code distribution, automated attacks, or activities that compromise infrastructure stability or multi-tenant boundaries.",
      },
      {
        title: "Service Availability & Maintenance",
        text: "We strive to maintain 99.9% uptime for our managed platform instances. Scheduled maintenance is communicated in advance. For custom project delivery, sprint cadence and milestone reviews occur on agreed cycles with live working demos.",
      },
      {
        title: "Intellectual Property Ownership",
        text: "Custom deliverables, source repositories, and client datasets created under a paid Statement of Work transfer 100% to the client upon full settlement of contract fees. Oryntic Labs retains ownership of its pre-existing core platform IP and underlying framework components.",
      },
      {
        title: "Payment Terms & Invoicing",
        text: "Invoices are issued in accordance with the payment schedule agreed in the governing SOW. Standard terms require payment within the stipulated days of invoice date, subject to applicable Indian Goods & Services Tax (GST) or international cross-border invoicing requirements.",
      },
      {
        title: "Termination & Data Offboarding",
        text: "Either party may terminate an ongoing service relationship per the notice provisions in the governing agreement. Upon termination, client databases and repositories are packaged for secure export and staging environments are safely decommissioned.",
      },
      {
        title: "Governing Law",
        text: "These terms of service and any separate commercial service agreements are governed by the laws of India, subject to the jurisdiction of the courts of Madhya Pradesh and Haryana.",
      },
    ],
  },
};

export default function Legal({ kind }) {
  const page = CONTENT[kind] || CONTENT["terms-conditions"];

  return (
    <main data-testid={`legal-page-${kind}`} className="min-h-screen bg-brand-ink text-white">
      {/* Hero Section */}
      <section data-testid="page-hero" className="relative overflow-hidden bg-brand-ink pt-36 pb-20 md:pt-48 md:pb-28">
        <img
          src={IMAGES.architecture}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-brand-ink/80" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/50 via-brand-ink/85 to-brand-ink" aria-hidden="true" />

        <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-brand-orange/15 blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-brand-blue/15 blur-[120px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-orange"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{page.overline}</span>
            </motion.div>

            <h1 className="mt-8 font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              <KineticLine delay={0.15}>{page.titleLine1}</KineticLine>
              <KineticLine delay={0.25}>
                <span className="text-brand-orange">{page.titleLine2}</span>
              </KineticLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              className="mt-8 max-w-3xl text-base md:text-xl leading-relaxed text-white/70"
            >
              {page.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              className="mt-10 flex flex-wrap items-center gap-4 text-xs text-white/60 border-t border-white/10 pt-6"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-orange" />
                <span>Last Updated: <strong>September 2026</strong></span>
              </div>
              <span className="hidden sm:inline text-white/20">•</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-blue" />
                <span>Entity: <strong>Oryntic Labs Private Limited</strong></span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sections List */}
      <section className="bg-brand-ink py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl px-6 md:px-10 space-y-8">
          {page.sections.map((s, i) => (
            <Reveal key={s.title} delay={0.04 * i}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8 transition-colors hover:border-white/20">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="h-3 w-px bg-white/20" />
                  <h2 className="font-display text-xl font-bold tracking-tight text-white md:text-2xl">
                    {s.title}
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-white/75 text-sm md:text-base border-t border-white/10 pt-4">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}

          {/* Quick Legal Support Card */}
          <div className="rounded-3xl border border-brand-orange/30 bg-gradient-to-br from-brand-orange/[0.08] to-transparent p-8 md:p-10">
            <h3 className="font-display text-2xl font-bold tracking-tight text-white">
              Questions regarding our <span className="text-brand-orange">terms or agreements?</span>
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Our legal and commercial team is available to assist with contract reviews, bilateral NDAs, or custom Statement of Work queries.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#e04a00]"
              >
                <span>Contact Legal Desk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/privacy-policy"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10"
              >
                <span>Privacy &amp; Data Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
