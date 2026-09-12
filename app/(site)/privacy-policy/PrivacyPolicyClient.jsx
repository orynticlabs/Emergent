"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  FileText,
  Search,
  CheckCircle2,
  Mail,
  ArrowRight,
  Calendar,
  Building2,
  Globe2,
  Cpu,
  Layers,
  Database,
  ExternalLink,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { IMAGES, CONTACT } from "@site/data/content";
import { Reveal, KineticLine, EASE } from "@site/components/site/Reveal";
import { useBookingModal } from "@site/components/site/BookingModalContext";
import { cn } from "@site/lib/utils";

const SECTIONS = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction & Corporate Identity",
    summary: "Entity details, commitment to privacy, and fundamental data principles.",
    content: (
      <div className="space-y-4">
        <p>
          Welcome to <strong>Oryntic Labs Private Limited</strong> (&quot;Oryntic Labs&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          We are an incorporated technology enterprise in India under the Companies Act, 2013 (<strong>CIN: U62011MP2026PTC085165</strong>; <strong>GSTIN: 23AAFCO2495P1ZX</strong>),
          operating engineering centers in Gurugram, Haryana and Rewa, Madhya Pradesh.
        </p>
        <p>
          At Oryntic Labs, transparency, confidentiality, and data protection are foundational to how we design, build, and deploy software.
          Whether you are exploring our marketing website (<a href="https://www.orynticlabs.com" className="text-brand-orange underline underline-offset-4">www.orynticlabs.com</a>),
          engaging our software engineering and staff augmentation practices, or utilizing our proprietary platforms—including <strong>OryAI</strong>, <strong>OryCMS</strong>, and <strong>PerformX</strong>—we
          treat your personal and commercial data with strict technical and organizational safeguards.
        </p>
        <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/[0.05] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
            <div className="text-sm leading-relaxed text-white/90">
              <strong className="text-white">Zero Data Monetization Principle:</strong> We do not sell, rent, lease, or monetize your personal data, customer records, or intellectual property under any circumstance. Your information is used exclusively to evaluate, build, execute, and service our technology engagements with you.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "scope",
    number: "02",
    title: "Scope of this Privacy Policy",
    summary: "Who this policy covers across our website, products, and services.",
    content: (
      <div className="space-y-4">
        <p>This Privacy Policy applies to all interactions with Oryntic Labs, covering:</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            "Visitors and users of our public website and subdomains",
            "Prospective clients submitting enquiries, scoping requests, or RFPs",
            "Clients contracting our custom software engineering or advisory services",
            "Subscribers and users of proprietary platforms: OryAI, OryCMS, and PerformX",
            "Professionals hired via our Staff Augmentation practice",
            "Job candidates, contractors, and business partners communicating with us",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-white/60">
          Where a formal Master Services Agreement (MSA), Statement of Work (SOW), Non-Disclosure Agreement (NDA), or custom Data Processing Addendum (DPA) is executed between Oryntic Labs and a client, the terms of that signed contract shall prevail in the event of any operational conflict with this general policy.
        </p>
      </div>
    ),
  },
  {
    id: "information-collected",
    number: "03",
    title: "Information We Collect",
    summary: "Directly provided details, project documentation, and automated technical data.",
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-display text-base font-bold text-white">A. Information You Provide Voluntarily</h4>
          <p className="mt-2 text-sm text-white/70">
            When communicating with us via our contact forms, scheduling consultations, or entering into commercial engagements, you may submit:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/70">
            <li><strong>Contact Details:</strong> Full name, professional work email, phone / WhatsApp number, company name, job title, and geographic location.</li>
            <li><strong>Project Briefs & Documentation:</strong> Software architecture specifications, technical requirements, uploaded RFP files, decks, wireframes, and business goals.</li>
            <li><strong>NDA & Contractual Records:</strong> Signatory names, business addresses, authorized corporate representatives, and confidentiality terms.</li>
            <li><strong>Billing & Commercial Information:</strong> Corporate billing address, GSTIN / VAT numbers, invoicing contacts, purchase orders, and payment records. We do not store raw credit/debit card numbers; payments are processed securely through certified gateway partners.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-bold text-white">B. Automatically Collected Technical Data</h4>
          <p className="mt-2 text-sm text-white/70">
            When browsing our website or interacting with our web platforms, standard technical diagnostic data is logged automatically:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/70">
            <li><strong>Device & Network Data:</strong> Internet Protocol (IP) address, browser family and version, operating system, screen resolution, and hardware architecture.</li>
            <li><strong>Usage & Navigation Metrics:</strong> Referral URLs, pages visited, time spent per section, button interactions, diagnostic error logs, and session durations.</li>
            <li><strong>Security & Authentication Tokens:</strong> Cryptographic session tokens, CSRF validation cookies, and verification flags to safeguard against unauthorized requests.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    number: "04",
    title: "How We Use Your Information",
    summary: "Operational purposes, contract fulfillment, system reliability, and communication.",
    content: (
      <div className="space-y-4">
        <p>We process your personal and project information strictly for transparent, lawful purposes:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Consultation & Scoping", desc: "Reviewing your project brief, understanding requirements, and preparing scoped technical roadmaps or architectural proposals." },
            { title: "Confidentiality & NDAs", desc: "Executing bilateral Non-Disclosure Agreements before discussing proprietary product logic or proprietary datasets." },
            { title: "Software Delivery", desc: "Building, testing, deploying, and maintaining custom web platforms, mobile applications, data pipelines, and cloud systems." },
            { title: "Platform Access", desc: "Provisioning and administering tenant accounts on OryAI, OryCMS, and PerformX, including role-based workspace permissions." },
            { title: "Billing & Compliance", desc: "Issuing formal invoices, processing milestone payments, and complying with statutory tax, GST, and corporate accounting laws." },
            { title: "Security & Fraud Defense", desc: "Monitoring server health, preventing distributed denial-of-service (DDoS) attempts, and safeguarding intellectual property." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h5 className="font-display text-sm font-bold text-brand-orange">{item.title}</h5>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "ai-data-isolation",
    number: "05",
    title: "Client Intellectual Property & AI Model Isolation",
    summary: "Guarantees that your source code, data, and prompts never train public AI models.",
    content: (
      <div className="space-y-4">
        <div className="rounded-2xl border border-brand-orange/40 bg-gradient-to-br from-brand-orange/[0.08] to-transparent p-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-brand-orange" />
            <h4 className="font-display text-lg font-bold text-white">Our AI Isolation Guarantee</h4>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            For all client projects and users of our <strong>OryAI</strong> agentic ecosystem, we adhere to strict architectural isolation:
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              <span><strong>No Public LLM Training:</strong> Client proprietary source code, private database schemas, user prompts, and knowledge base documents are <em>never</em> used to train, retrain, or fine-tune public foundational models (such as commercial OpenAI, Anthropic, or open-source community weights).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              <span><strong>Client Ownership of IP:</strong> All code, algorithms, custom-trained weights, models, and digital assets developed under client work orders remain the 100% exclusive intellectual property of the client upon settlement of contractual dues.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              <span><strong>Private Vector & RAG Silos:</strong> Vector embeddings, indexed knowledge bases, and retrieval-augmented generation (RAG) stores are logically or physically isolated per client environment with granular access control tokens.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "legal-bases",
    number: "06",
    title: "Legal Bases for Processing (DPDP Act & GDPR)",
    summary: "Statutory compliance under India's DPDP Act 2023 and international standards.",
    content: (
      <div className="space-y-4">
        <p>
          In accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India and global regulations such as the <strong>General Data Protection Regulation (GDPR)</strong>, we process personal data under one or more recognized legal grounds:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h5 className="font-display text-sm font-bold text-white">1. Consent</h5>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              When you voluntarily submit a message, tick our NDA request box, or opt in to receive WhatsApp/SMS status updates. You can withdraw your consent at any time.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h5 className="font-display text-sm font-bold text-white">2. Performance of Contract</h5>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Where processing is required to execute a service proposal, fulfill contract milestones, deploy software, or support an active platform license.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h5 className="font-display text-sm font-bold text-white">3. Statutory Legal Obligations</h5>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Where retention or reporting is mandated by Indian laws, including the Companies Act, Income Tax Act, Goods and Services Tax (GST) laws, and cybersecurity directives.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h5 className="font-display text-sm font-bold text-white">4. Legitimate Interests</h5>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              To defend our infrastructure from cyber threats, secure our systems against unauthorized access, optimize performance, and manage business operations responsibly.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "data-sharing",
    number: "07",
    title: "Data Sharing & Third-Party Disclosures",
    summary: "Vetted infrastructure partners, strict confidentiality, and zero data brokerage.",
    content: (
      <div className="space-y-4">
        <p>
          We do not sell, trade, or broadcast personal information. Third-party disclosures occur solely in strictly controlled scenarios:
        </p>
        <ul className="space-y-3 text-sm text-white/75">
          <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white">Cloud Infrastructure & Tooling Providers:</strong> We utilize Tier-1 cloud providers (such as Amazon Web Services, Google Cloud Platform, and Microsoft Azure) to host platform infrastructure, databases, and continuous deployment environments. All vendors are subject to data protection agreements and ISO/SOC-2 certifications.
          </li>
          <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white">Communication & Transactional Services:</strong> Secure transactional email systems, messaging APIs (e.g., Twilio/WhatsApp Business API for client communication), and certified payment gateways bound by strict non-disclosure obligations.
          </li>
          <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white">Statutory & Law Enforcement Requests:</strong> We disclose information only if strictly compelled by a lawful order from a court of competent jurisdiction or government authority having direct legal remit under applicable Indian law.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "security",
    number: "08",
    title: "Data Security & ISO 27001 Safeguards",
    summary: "End-to-end encryption, role-based access, and continuous vulnerability monitoring.",
    content: (
      <div className="space-y-4">
        <p>
          We employ enterprise-grade technical and organizational measures aligned with <strong>ISO/IEC 27001</strong> standards to protect data against unauthorized disclosure, loss, alteration, or compromise:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Lock, title: "Encryption in Transit & at Rest", desc: "Transport Layer Security (TLS 1.3) across all endpoints and AES-256 bit encryption for databases, persistent disks, and archival storage." },
            { icon: ShieldCheck, title: "Principle of Least Privilege", desc: "Internal access to client source code and databases is restricted strictly to assigned engineers via Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA)." },
            { icon: Database, title: "Automated Backups & Redundancy", desc: "Daily snapshots, geo-redundant storage with point-in-time recovery capabilities, and encrypted off-site archives." },
            { icon: Layers, title: "Continuous Audits & CI/CD Checks", desc: "Automated dependency security auditing, static code analysis (SAST), vulnerability patching, and strict Git repository protections." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
              <div>
                <h5 className="font-display text-sm font-bold text-white">{item.title}</h5>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "data-retention",
    number: "09",
    title: "Data Retention & Secure Deletion",
    summary: "Clear retention timelines, project archiving, and contractual erasure.",
    content: (
      <div className="space-y-4">
        <p>
          We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or required by contractual, legal, or accounting mandates:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-white/70">
          <li><strong>Enquiry & Lead Records:</strong> Retained for 24 months from last interaction to provide context if discussions resume, unless deletion is requested earlier.</li>
          <li><strong>Client Project Code & Databases:</strong> Maintained during active engineering and warranty periods. Following handover, staging databases are decommissioned per project agreement.</li>
          <li><strong>Statutory Invoices & Corporate Records:</strong> Retained for a minimum of 7 to 8 years in compliance with Section 128 of the Indian Companies Act, 2013 and Goods & Services Tax rules.</li>
        </ul>
        <p className="text-sm text-white/60">
          When retention periods expire, data is securely destroyed via cryptographic erasure or non-recoverable electronic file shredding.
        </p>
      </div>
    ),
  },
  {
    id: "your-rights",
    number: "10",
    title: "Your Statutory Privacy Rights",
    summary: "Access, correction, erasure, data portability, and withdrawal of consent.",
    content: (
      <div className="space-y-4">
        <p>Depending on your jurisdiction (including under India&apos;s DPDP Act and GDPR), you have specific statutory rights concerning your personal information:</p>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-brand-orange">
              <tr>
                <th className="px-4 py-3">Right</th>
                <th className="px-4 py-3">What it Means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/[0.02]">
              {[
                { right: "Right to Access", desc: "Request a copy of the personal data we hold about you and details on how it is processed." },
                { right: "Right to Rectification", desc: "Request correction of inaccurate, incomplete, or outdated information." },
                { right: "Right to Erasure", desc: "Request deletion of your personal records (Right to be Forgotten) where statutory retention is not mandated." },
                { right: "Right to Data Portability", desc: "Obtain your provided data in a structured, commonly used, machine-readable format (JSON/CSV)." },
                { right: "Right to Withdraw Consent", desc: "Revoke consent for optional updates or communications at any time without penalty." },
                { right: "Right to Grievance Redressal", desc: "Lodge a formal enquiry or complaint with our designated Data Grievance Officer." },
              ].map((row) => (
                <tr key={row.right} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{row.right}</td>
                  <td className="px-4 py-3 text-white/70">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/60">
          To exercise any of these rights, email us directly at <a href="mailto:support@orynticlabs.com" className="text-brand-orange underline">support@orynticlabs.com</a>. We acknowledge all requests within 48 hours and process them within 30 days.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    number: "11",
    title: "Cookies & Tracking Technologies",
    summary: "How we use session and security tokens, and how you can manage them.",
    content: (
      <div className="space-y-4">
        <p>
          We use minimal cookies and local browser storage essential for website security, performance, and user experience:
        </p>
        <ul className="space-y-2 text-sm text-white/70">
          <li><strong>Strictly Necessary Cookies:</strong> Required to keep you authenticated, prevent cross-site request forgery (CSRF), and maintain session integrity.</li>
          <li><strong>Performance & Analytics:</strong> Aggregated, privacy-friendly telemetry to identify broken links, monitor page load speeds, and improve technical documentation.</li>
        </ul>
        <p className="text-sm text-white/60">
          You can configure your browser to block or alert you about cookies. However, disabling essential cookies may impact specific portal functionalities. We respect &quot;Do Not Track&quot; (DNT) browser headers.
        </p>
      </div>
    ),
  },
  {
    id: "international-transfers",
    number: "12",
    title: "International Data Transfers",
    summary: "Cross-border engineering operations with Standard Contractual Clauses.",
    content: (
      <div className="space-y-4">
        <p>
          Oryntic Labs delivers engineering solutions to clients globally across North America, Europe, the United Kingdom, the Middle East, and Asia-Pacific.
          While our core engineering offices are in India, data transfers across national borders are protected by:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-white/70">
          <li>Execution of Standard Contractual Clauses (SCCs) approved by international privacy bodies.</li>
          <li>Comprehensive Data Processing Agreements (DPAs) stipulating technical confidentiality.</li>
          <li>Data residency options: Enterprise clients may specify regional data storage on AWS (e.g., us-east-1, eu-central-1, ap-south-1) to satisfy local regulatory mandates.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "children",
    number: "13",
    title: "Children's Privacy Protection",
    summary: "Strict enterprise and adult focus (18+).",
    content: (
      <p className="text-sm leading-relaxed text-white/75">
        Our website, services, and proprietary software products are designed strictly for businesses, technology practitioners, and individuals who are at least 18 years of age.
        We do not knowingly solicit or collect personal information from minors. If you believe a minor has submitted personal information through our platform, contact us immediately at <a href="mailto:support@orynticlabs.com" className="text-brand-orange underline">support@orynticlabs.com</a>, and we will promptly purge the data from our repositories.
      </p>
    ),
  },
  {
    id: "grievance-contact",
    number: "14",
    title: "Grievance Officer & Official Inquiries",
    summary: "Designated point of contact for regulatory, legal, and privacy matters.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-white/80">
          In compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, the details of our designated Grievance Officer and corporate legal team are provided below:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-brand-orange">Legal & Grievance Officer</h5>
            <div className="mt-3 space-y-2 text-sm text-white/75">
              <p className="font-medium text-white">Oryntic Labs Legal & Compliance Team</p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-orange" />
                <a href="mailto:support@orynticlabs.com" className="hover:text-white underline">support@orynticlabs.com</a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-orange" />
                <a href="tel:+917648915266" className="hover:text-white">+91 76489 15266</a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-brand-orange">Registered Office</h5>
            <div className="mt-3 space-y-2 text-sm text-white/75">
              <p className="font-medium text-white">Oryntic Labs Private Limited</p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                Ward 14, Main Stand, Mangawan, Rewa, Madhya Pradesh 486111, India
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-white/60">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                Corporate Hub: 6th Venture X, Landmark, Sector 67, Gurugram, Haryana 122101, India
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "updates",
    number: "15",
    title: "Updates to this Privacy Policy",
    summary: "Notification procedure for future policy amendments.",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-white/75">
          We may amend this Privacy Policy periodically to reflect emerging engineering capabilities, new product releases, or legislative updates under Indian and international privacy statutes.
          When changes occur, we update the <strong>&quot;Last Revised&quot;</strong> timestamp at the top of this document.
          For significant changes, we will provide additional notice through banner notifications on our platforms or direct email communications to active account holders.
        </p>
        <p className="text-xs text-white/50">
          Last revised: September 2026 · Version 2.4 · Oryntic Labs Private Limited.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPolicyClient() {
  const { openModal: openBookingModal } = useBookingModal();
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.number.includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeNavRef = useRef(null);

  useEffect(() => {
    if (activeNavRef.current) {
      activeNavRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeSection]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -120 });
      } else {
        const offset = 120;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: "smooth",
        });
      }
      setActiveSection(id);
    }
  };

  return (
    <main data-testid="privacy-policy-page" className="min-h-screen bg-brand-ink text-white">
      {/* Hero Section */}
      <section data-testid="page-hero" className="relative overflow-hidden bg-brand-ink pt-36 pb-20 md:pt-48 md:pb-28">
        <img
          src={IMAGES.datacenter}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-brand-ink/80" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/60 via-brand-ink/90 to-brand-ink" aria-hidden="true" />

        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-96 w-96 rounded-full bg-brand-orange/15 blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-brand-blue/15 blur-[130px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-orange"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Legal & Data Protection</span>
            </motion.div>

            <h1 className="mt-8 font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              <KineticLine delay={0.15}>Privacy &amp; Data</KineticLine>
              <KineticLine delay={0.25}>
                <span className="text-brand-orange">Protection Policy.</span>
              </KineticLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              className="mt-8 max-w-3xl text-base md:text-xl leading-relaxed text-white/70"
            >
              How Oryntic Labs Private Limited collects, safeguards, and respects your personal data,
              proprietary source code, and commercial specifications across our engineering services
              and software platforms.
            </motion.p>

            {/* Quick Metadata Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              className="mt-10 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-white/60 border-t border-white/10 pt-6"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-orange" />
                <span>Effective Date: <strong>September 2026</strong></span>
              </div>
              <span className="hidden sm:inline text-white/20">•</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-blue" />
                <span>Entity: <strong>Oryntic Labs Private Limited</strong></span>
              </div>
              <span className="hidden sm:inline text-white/20">•</span>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-emerald-400" />
                <span>DPDP Act 2023 &amp; GDPR Aligned</span>
              </div>
            </motion.div>
          </div>

          {/* Trust Guarantees Grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Zero Data Sale", desc: "Never monetized or traded" },
              { label: "ISO 27001 Controls", desc: "Enterprise security hygiene" },
              { label: "AI Model Isolation", desc: "Code never trains public LLMs" },
              { label: "Mutual NDAs", desc: "Signed before first call" },
            ].map((item, idx) => (
              <Reveal key={item.label} delay={0.05 * idx}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:border-brand-orange/40 hover:bg-white/[0.05]">
                  <p className="font-display text-sm font-bold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-white/50">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Navigation */}
      <section className="relative mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 flex max-h-[calc(100vh-8.5rem)] flex-col rounded-3xl border border-white/15 bg-[#0e0e14]/90 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex shrink-0 items-center justify-between">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  Table of Contents
                </h3>
                <span className="rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-orange">
                  {SECTIONS.length} Sections
                </span>
              </div>

              {/* Search filter within policy */}
              <div className="relative mt-4 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter policy sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none transition-colors focus:border-brand-orange"
                />
              </div>

              {/* Navigation links */}
              <nav
                data-lenis-prevent
                className="scrollbar-thin scrollbar-thumb-white/10 mt-5 flex-1 space-y-1 overflow-y-auto pr-1"
              >
                {filteredSections.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      ref={isActive ? activeNavRef : null}
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "group flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-all duration-200",
                        isActive
                          ? "bg-brand-orange/15 font-semibold text-brand-orange"
                          : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                      )}
                    >
                      <span className={cn("font-mono text-[10px] shrink-0 mt-0.5", isActive ? "text-brand-orange" : "text-white/30")}>
                        {s.number}
                      </span>
                      <span className="truncate">{s.title}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Contact & Action Box */}
              <div className="mt-6 shrink-0 border-t border-white/10 pt-5 space-y-3">
                <p className="text-xs text-white/50">Need a signed DPA or privacy clarification?</p>
                <a
                  href={`mailto:${CONTACT.support}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email Privacy Team
                </a>
                <Link
                  href="/terms-conditions"
                  className="inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-white/60 hover:text-brand-orange transition-colors"
                >
                  <span>View Terms &amp; Conditions</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Policy Clauses Body */}
          <div className="lg:col-span-8 space-y-12">
            {filteredSections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                data-testid={`privacy-section-${section.id}`}
                className="scroll-mt-32 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8 transition-colors hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand-orange">
                    {section.number}
                  </span>
                  <div className="h-3 w-px bg-white/20" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {section.title}
                  </h2>
                </div>

                <p className="mt-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                  {section.summary}
                </p>

                <div className="mt-6 leading-relaxed text-white/80 text-sm sm:text-base border-t border-white/10 pt-6">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Bottom Call to Action */}
            <div className="rounded-3xl border border-brand-orange/30 bg-gradient-to-br from-brand-orange/[0.08] via-transparent to-brand-blue/[0.08] p-8 md:p-10">
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
                Have questions about data handling or <span className="text-brand-orange">mutual NDAs?</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed text-white/65">
                We sign Non-Disclosure Agreements before your kickoff call, ensuring total protection for your architecture, business concept, and data pipelines.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_15px_30px_-10px_rgba(255,85,0,0.5)] transition-colors hover:bg-[#e04a00]"
                >
                  <span>Request NDA &amp; Contact Us</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={openBookingModal}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Free Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
