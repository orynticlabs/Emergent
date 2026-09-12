"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  Mail,
  ArrowRight,
  Calendar,
  Building2,
  Scale,
  Cpu,
  Layers,
  Phone,
  MapPin,
  ChevronRight,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { IMAGES, CONTACT } from "@site/data/content";
import { Reveal, KineticLine, EASE } from "@site/components/site/Reveal";
import { useBookingModal } from "@site/components/site/BookingModalContext";
import { cn } from "@site/lib/utils";

const SECTIONS = [
  {
    id: "corporate-entity",
    number: "01",
    title: "Corporate Identity & Acceptance of Terms",
    summary: "Entity information, legal capacity, and scope of these Terms & Conditions.",
    content: (
      <div className="space-y-4">
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you—whether individually or on behalf of an entity you represent (&quot;Client&quot;, &quot;you&quot;, or &quot;your&quot;)—and{" "}
          <strong>Oryntic Labs Private Limited</strong> (&quot;Oryntic Labs&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), an incorporated technology enterprise under the Indian Companies Act, 2013 (<strong>CIN: U62011MP2026PTC085165</strong>; <strong>GSTIN: 23AAFCO2495P1ZX</strong>).
        </p>
        <p>
          By accessing or browsing our website (<a href="https://www.orynticlabs.com" className="text-brand-orange underline underline-offset-4">www.orynticlabs.com</a>), communicating with our team, submitting an enquiry or RFP, accessing our proprietary platforms (including <strong>OryAI</strong>, <strong>OryCMS</strong>, and <strong>PerformX</strong>), or engaging our software engineering practices, you acknowledge that you have read, understood, and agreed to be bound by these Terms.
        </p>
        <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/[0.05] p-5">
          <div className="flex items-start gap-3">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
            <div className="text-sm leading-relaxed text-white/90">
              <strong className="text-white">Legal Capacity:</strong> You represent and warrant that you are at least 18 years of age and possess full legal capacity and corporate authorization to enter into these Terms on behalf of yourself or the business organization you represent.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "services-scope",
    number: "02",
    title: "Scope of Services & Engagement Models",
    summary: "Engineering practices, platform delivery, and staff augmentation.",
    content: (
      <div className="space-y-4">
        <p>
          Oryntic Labs delivers end-to-end technology solutions across four primary operational models:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "Custom Software Engineering",
              desc: "Full-lifecycle architecture, web applications, mobile apps (iOS & Android), AI/ML systems, cloud infrastructure, and data engineering.",
            },
            {
              title: "Proprietary Platforms (SaaS & PaaS)",
              desc: "Subscription licensing and managed instances of OryAI (agent orchestration), OryCMS (headless content platform), and PerformX.",
            },
            {
              title: "Staff Augmentation",
              desc: "Placing vetted software engineers, cloud architects, and product designers directly inside client teams under client-led workflows.",
            },
            {
              title: "Technology Strategy & Advisory",
              desc: "System audits, scalability roadmaps, cloud cost optimizations, and AI integration feasibility studies.",
            },
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
    id: "contract-precedence",
    number: "03",
    title: "Priority of Signed Agreements (MSA & SOW)",
    summary: "How executed bilateral contracts supersede general website documentation.",
    content: (
      <div className="space-y-4">
        <p>
          Website copy, marketing collateral, case studies, and automated estimates provide general information and do not constitute an irrevocable commercial offer.
        </p>
        <p>
          All commercial software engineering, dedicated staffing, or platform licensing engagements are governed by specific, executed bilateral agreements:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-white/75">
          <li><strong>Master Services Agreement (MSA):</strong> Establishes core legal, liability, warranty, and indemnification terms.</li>
          <li><strong>Statement of Work (SOW):</strong> Defines precise sprint deliverables, project architecture, milestones, acceptance criteria, and fee schedules.</li>
          <li><strong>Non-Disclosure Agreement (NDA):</strong> Enforces strict trade secret and architectural confidentiality.</li>
          <li><strong>Service Level Agreement (SLA):</strong> Stipulates uptime commitments and support response windows.</li>
        </ul>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80">
          <strong className="text-white">Precedence Rule:</strong> In the event of any contradiction or inconsistency between these website Terms &amp; Conditions and a formally executed contract (MSA/SOW/NDA), the provisions of the executed agreement shall strictly govern and supersede.
        </div>
      </div>
    ),
  },
  {
    id: "intellectual-property",
    number: "04",
    title: "Intellectual Property Rights & 100% Client Ownership",
    summary: "Clear distinction between Oryntic Labs platform IP and client custom deliverables.",
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-display text-base font-bold text-white">A. 100% Client Ownership of Custom Deliverables</h4>
          <p className="mt-2 text-sm text-white/75">
            Upon receipt of full payment for agreed milestones under a Statement of Work, <strong>all custom source code, specialized database schemas, graphic designs, algorithms, workflows, and documentation created specifically for the Client shall be the sole and exclusive intellectual property of the Client</strong>. Oryntic Labs assigns all right, title, and interest in such custom deliverables to the Client without ongoing royalty requirements.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base font-bold text-white">B. Oryntic Labs Pre-Existing IP &amp; Platform Assets</h4>
          <p className="mt-2 text-sm text-white/75">
            Oryntic Labs retains all right, title, and interest in its pre-existing core intellectual property, including proprietary software platforms (OryAI, OryCMS, PerformX), internal developer boilerplate utilities, and algorithmic frameworks developed prior to or independently of the client engagement. Where pre-existing tools are embedded within a deliverable, the Client is granted a perpetual, non-exclusive, worldwide, royalty-free license to use, execute, and modify the embedded runtime components for their internal business operations.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base font-bold text-white">C. Website Content &amp; Trademarks</h4>
          <p className="mt-2 text-sm text-white/75">
            All trademarks, logos, brand names, visual styles, and website copy on <code className="text-brand-orange">orynticlabs.com</code> are proprietary to Oryntic Labs Private Limited. No license is granted to copy, reproduce, or frame any site content without prior written authorization.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "confidentiality-nda",
    number: "05",
    title: "Confidentiality & Non-Disclosure (NDAs)",
    summary: "Protection of client business ideas, architectural specs, and trade secrets.",
    content: (
      <div className="space-y-4">
        <div className="rounded-2xl border border-brand-orange/40 bg-brand-orange/[0.05] p-6">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-brand-orange" />
            <h4 className="font-display text-lg font-bold text-white">Our Confidentiality Commitment</h4>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            We understand that building breakthrough software requires sharing proprietary business concepts, proprietary datasets, and roadmap architectures.
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <span><strong>Pre-Call Mutual NDAs:</strong> We routinely execute bilateral Non-Disclosure Agreements before holding detailed technical discovery sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <span><strong>Internal Access Controls:</strong> Client project documents, briefs, and codebases are restricted solely to engineers assigned to the engagement.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <span><strong>Non-Disclosure Survival:</strong> Confidentiality obligations survive termination of the commercial engagement for a minimum duration of 5 years (and indefinitely with respect to trade secrets and source code).</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "ai-isolation-terms",
    number: "06",
    title: "AI Ecosystem & LLM Model Isolation",
    summary: "Guarantees that your source code, data, and prompts never train public models.",
    content: (
      <div className="space-y-4">
        <p>
          When utilizing our AI engineering practices or deploying agents through <strong>OryAI</strong>:
        </p>
        <ul className="space-y-3 text-sm text-white/75">
          <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white">Zero Public Model Retraining:</strong> We guarantee that Client proprietary code, prompts, conversational context, and indexed knowledge stores are <em>never</em> used to train, retrain, or improve public foundational LLMs (e.g., commercial OpenAI, Anthropic, or community models).
          </li>
          <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white">Isolated Tenant Architecture:</strong> Client vector databases (e.g., pgvector, Pinecone, Qdrant) and RAG pipelines are provisioned in isolated cloud environments with cryptographic access tokens.
          </li>
          <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white">Custom Model Weights Ownership:</strong> Any custom model weights fine-tuned or trained on Client proprietary datasets remain the 100% intellectual property of the Client.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "user-conduct",
    number: "07",
    title: "Permitted Use & Prohibited Conduct",
    summary: "Acceptable use guidelines for our website, APIs, and client portals.",
    content: (
      <div className="space-y-4">
        <p>You agree to use our website and platforms solely for lawful, legitimate business purposes. You agree not to:</p>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm text-white/75">
          {[
            "Attempt unauthorized access to our servers, infrastructure, or databases",
            "Perform automated data scraping or harvesting without prior written consent",
            "Launch denial-of-service (DDoS) attacks or deliberately overload our systems",
            "Decompile, disassemble, or reverse engineer any platform runtimes or APIs",
            "Transmit viruses, worms, trojans, or malicious payloads through any contact field",
            "Impersonate any individual, organization, or Oryntic Labs team member",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/60">
          Any breach of these conduct rules will result in immediate termination of access and may trigger civil or criminal legal proceedings under the Indian Information Technology Act, 2000.
        </p>
      </div>
    ),
  },
  {
    id: "staff-augmentation-terms",
    number: "08",
    title: "Staff Augmentation & Dedicated Engineers",
    summary: "Terms governing dedicated talent placement and collaboration.",
    content: (
      <div className="space-y-4">
        <p>
          Where a Client contracts Oryntic Labs for Staff Augmentation:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-white/75">
          <li><strong>Operational Integration:</strong> Engineers sit directly within the Client&apos;s daily standups, issue trackers, and communications channels (Slack, Jira, Linear), working the Client&apos;s designated hours and time zones.</li>
          <li><strong>Talent Vetting &amp; Replacement:</strong> All assigned engineers undergo multi-stage technical and cultural screening. If an engineer fails to meet expectations, Oryntic Labs provides a qualified replacement within the contractual notice period.</li>
          <li><strong>Direct Employment:</strong> Engineers remain employees or direct contractors of Oryntic Labs Private Limited. We handle payroll, statutory benefits, provident funds, and equipment provisioning.</li>
          <li><strong>Non-Solicitation:</strong> The Client agrees not to directly solicit, hire, or engage placed engineers outside of Oryntic Labs during the engagement and for 12 months following its conclusion, unless an agreed buyout fee is settled.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "billing-payments",
    number: "09",
    title: "Fees, Invoicing & Commercial Terms",
    summary: "Payment milestones, accepted currencies, GST compliance, and default policies.",
    content: (
      <div className="space-y-4">
        <p>
          Commercial terms are defined within the applicable Statement of Work or SaaS subscription plan:
        </p>
        <ul className="space-y-2.5 text-sm text-white/75">
          <li><strong>Milestone &amp; Sprint Invoicing:</strong> Fixed-scope projects are invoiced against verified deliverables. Staff augmentation and dedicated teams are billed on agreed bi-weekly or monthly cycles.</li>
          <li><strong>Currency &amp; Taxes:</strong> Domestic contracts in India are denominated in INR and subject to 18% Goods &amp; Services Tax (GST). International engagements may be invoiced in USD, EUR, GBP, or AED, compliant with cross-border trade guidelines.</li>
          <li><strong>Payment Window:</strong> Standard invoices are due within 14 calendar days of issuance, unless a different timeline is stipulated in the signed contract.</li>
          <li><strong>Late Payments:</strong> Overdue balances may accrue interest at the rate of 1.5% per month or the legal statutory maximum, whichever is lower. Work deliverables or staging environment access may be temporarily paused if accounts fall significantly past due.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "third-party-services",
    number: "10",
    title: "Third-Party Tools & Cloud Infrastructure",
    summary: "Interactions with AWS, Google Cloud, payment gateways, and external APIs.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-white/75 leading-relaxed">
          In architecting modern software, we integrate third-party cloud infrastructure (e.g., AWS, GCP, Azure), payment gateways (e.g., Razorpay, Stripe), communication gateways (e.g., Twilio, SendGrid), and AI provider APIs.
        </p>
        <p className="text-sm text-white/75 leading-relaxed">
          While we architect with multi-region redundancy, graceful fallback handling, and disaster recovery protocols, Oryntic Labs is not liable for upstream outages, rate limits, or unilateral API deprecations caused by third-party cloud providers beyond our direct control.
        </p>
      </div>
    ),
  },
  {
    id: "warranty-disclaimer",
    number: "11",
    title: "Warranties, Guarantees & Disclaimers",
    summary: "Standard warranty windows, bug-fix guarantees, and general disclaimers.",
    content: (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h4 className="font-display text-sm font-bold text-brand-orange uppercase tracking-wider">
            Standard Engineering Warranty
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            For custom software engineering engagements, Oryntic Labs provides a standard <strong>30 to 90-day post-launch warranty window</strong> (as specified in the SOW). During this warranty period, any reproducible functional bugs or defects violating agreed specifications are remediated at zero additional charge.
          </p>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          Except as expressly set forth in an executed bilateral contract, our website, digital content, and generic software estimates are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of any kind, whether statutory, express, or implied, including warranties of merchantability, fitness for a particular commercial purpose, or uninterrupted availability.
        </p>
      </div>
    ),
  },
  {
    id: "limitation-liability",
    number: "12",
    title: "Limitation of Liability",
    summary: "Consequential damage exclusions and maximum liability caps.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-white/75 leading-relaxed">
          To the maximum extent permitted by applicable law:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-white/75">
          <li><strong>Exclusion of Consequential Damages:</strong> Neither Oryntic Labs Private Limited nor the Client shall be liable to the other for any indirect, incidental, punitive, special, or consequential damages, including loss of business profits, goodwill, anticipated savings, or data disruption.</li>
          <li><strong>Aggregate Monetary Cap:</strong> The total aggregate liability of Oryntic Labs arising out of or related to any project engagement, whether in contract, tort (including negligence), or otherwise, shall be strictly capped at the total amount actually paid by the Client to Oryntic Labs under the specific Statement of Work in the six (6) months preceding the incident.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "indemnification",
    number: "13",
    title: "Indemnification",
    summary: "Mutual defense against third-party claims and IP infringement.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-white/75 leading-relaxed">
          <strong>Mutual IP Indemnification:</strong> Oryntic Labs agrees to defend and hold harmless the Client against any third-party claim alleging that our custom software deliverables infringe a valid patent, copyright, or registered trademark, provided the deliverable was not modified by the Client or built strictly to client-mandated infringing specifications.
        </p>
        <p className="text-sm text-white/75 leading-relaxed">
          Similarly, the Client agrees to defend and hold harmless Oryntic Labs against third-party claims arising from client-supplied assets, datasets, or materials that violate third-party intellectual property or privacy rights.
        </p>
      </div>
    ),
  },
  {
    id: "governing-law-disputes",
    number: "14",
    title: "Governing Law & Dispute Resolution",
    summary: "Applicable Indian statutory framework and tiered arbitration resolution.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-white/80 leading-relaxed">
          These Terms, and all commercial engagements arising hereunder, shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>, without regard to conflict of law principles.
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <h5 className="font-display text-sm font-bold text-brand-orange uppercase tracking-wider">Dispute Escalation Framework</h5>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-white/75">
            <li><strong>Amicable Negotiation:</strong> The parties shall first attempt in good faith to resolve any dispute through direct executive discussions between designated corporate leaders within thirty (30) days.</li>
            <li><strong>Arbitration:</strong> If unresolved, the dispute shall be finally settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 of India. The seat of arbitration shall be New Delhi / Gurugram or Jabalpur, conducted in the English language.</li>
            <li><strong>Exclusive Court Jurisdiction:</strong> Subject to the arbitration clause, the competent courts in Haryana and Madhya Pradesh, India, shall have exclusive territorial jurisdiction over any judicial proceeding.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: "term-modifications-contact",
    number: "15",
    title: "Term Modifications & Official Legal Contacts",
    summary: "Revision notices and designated corporate contacts for legal inquiries.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-white/75 leading-relaxed">
          We reserve the right to revise or update these Terms periodically to reflect changes in our software practices, regulatory statutory requirements, or commercial offerings. Continued use of our website or services after such updates constitutes acceptance of the amended Terms.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-brand-orange">Legal &amp; Contracts Desk</h5>
            <div className="mt-3 space-y-2 text-sm text-white/75">
              <p className="font-medium text-white">Oryntic Labs Legal Team</p>
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
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-brand-orange">Corporate Offices</h5>
            <div className="mt-3 space-y-2 text-sm text-white/75">
              <p className="font-medium text-white">Oryntic Labs Private Limited</p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                Registered: Ward 14, Main Stand, Mangawan, Rewa, Madhya Pradesh 486111, India
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
];

export default function TermsConditionsClient() {
  const { openModal: openBookingModal } = useBookingModal();
  const [activeSection, setActiveSection] = useState("corporate-entity");
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
    <main data-testid="terms-conditions-page" className="min-h-screen bg-brand-ink text-white">
      {/* Hero Section */}
      <section data-testid="page-hero" className="relative overflow-hidden bg-brand-ink pt-36 pb-20 md:pt-48 md:pb-28">
        <img
          src={IMAGES.architecture}
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
              <Scale className="h-3.5 w-3.5" />
              <span>Commercial &amp; Legal Framework</span>
            </motion.div>

            <h1 className="mt-8 font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              <KineticLine delay={0.15}>Terms &amp;</KineticLine>
              <KineticLine delay={0.25}>
                <span className="text-brand-orange">Conditions.</span>
              </KineticLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              className="mt-8 max-w-3xl text-base md:text-xl leading-relaxed text-white/70"
            >
              The terms governing use of the Oryntic Labs website, client project engagements,
              proprietary software platforms (OryAI, OryCMS, PerformX), and engineering talent placement.
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
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Jurisdiction: <strong>Courts of India</strong></span>
              </div>
            </motion.div>
          </div>

          {/* Trust Highlights Grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "100% Client IP", desc: "Custom code transfers to you" },
              { label: "Pre-Call NDAs", desc: "Confidentiality executed first" },
              { label: "Contract Precedence", desc: "Executed SOWs supersede site copy" },
              { label: "Warranty Backed", desc: "Standard 30–90 day defect coverage" },
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

              {/* Search filter within terms */}
              <div className="relative mt-4 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter terms sections..."
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
                <p className="text-xs text-white/50">Questions about contracts, MSAs, or SOWs?</p>
                <a
                  href={`mailto:${CONTACT.support}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact Legal Desk
                </a>
                <Link
                  href="/privacy-policy"
                  className="inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-white/60 hover:text-brand-orange transition-colors"
                >
                  <span>View Privacy Policy</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Terms Clauses Body */}
          <div className="lg:col-span-8 space-y-12">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                data-testid={`terms-section-${section.id}`}
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
                Ready to scope your project? <span className="text-brand-orange">We sign NDAs first.</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed text-white/65">
                Every client engagement begins with clear requirements, guaranteed IP assignment, and milestone-based sprint delivery.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_15px_30px_-10px_rgba(255,85,0,0.5)] transition-colors hover:bg-[#e04a00]"
                >
                  <span>Start a Conversation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={openBookingModal}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Free Consultation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
