"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight, Calendar, Linkedin, Instagram, Facebook, Twitter, Youtube,
} from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { useBookingModal } from "@site/components/site/BookingModalContext";
import { Reveal } from "@site/components/site/Reveal";
import { SERVICES, INDUSTRIES, PRODUCTS } from "@site/data/content";
import Logo from "@site/components/site/Logo";

// Relative — these routes are served by this same Next.js app, so they must
// resolve against whatever origin the page was loaded from, not a hardcoded
// (and easily stale) separate deployment URL.
const API = `/api`;

const FALLBACK = {
  company: {
    email: "hello@orynticlabs.com",
    sales_email: "sales@orynticlabs.com",
    support_email: "support@orynticlabs.com",
    phone: "+91 76489 15266",
    address1: "Ward 14, Main Stand, Mangawan, Rewa, Madhya Pradesh 486111, India",
    address2: "OrynticLabs Private Limited, 6th Venture X, Landmark, Sector 67, Gurugram, Haryana 122101, India",
    cin: "U62011MP2026PTC085165",
    gst: "Available on request",
  },
  socials: {
    linkedin: "https://www.linkedin.com/company/orynticlabs",
    instagram: "https://www.instagram.com/orynticlabs",
    x: "https://twitter.com/orynticlabs",
    youtube: "https://www.youtube.com/@orynticlabs",
  },
  columns: [],
  certificates: [
    { label: "Startup India Recognized", image: "/assets/startup-india.png" },
    { label: "ISO 27001 Certified", image: "/assets/iso-27001.png" },
    { label: "DMCA Protected", image: "/assets/dmca.png" },
  ],
  legal_links: [],
  copyright: "© 2026 OrynticLabs Private Limited. All rights reserved.",
};

const SOCIAL_ICONS = { linkedin: Linkedin, instagram: Instagram, facebook: Facebook, x: Twitter, youtube: Youtube };

// Multi-column link directory — same structural role as a "Products / Tools
// / Guides / General" footer, reworked for what OrynticLabs actually has.
const FOOTER_LINK_GROUPS = [
  {
    title: "Services",
    links: SERVICES.map((s) => ({ label: s.title, to: "/services" })),
  },
  {
    title: "Industries We Serve",
    links: INDUSTRIES.map((ind) => ({ label: ind.name, to: "/industries" })),
  },
  {
    title: "Our Products",
    links: PRODUCTS.map((p) => ({ label: p.name, to: "/products" })),
  },
  {
    title: "Company",
    links: [
      { label: "Portfolio", to: "/portfolio" },
      { label: "Hire Staff", to: "/hire-staff" },
      { label: "Technology Stack", to: "/stack" },
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact-us" },
    ],
  },
];

const FooterLink = ({ to, children }) => (
  <Link
    href={to}
    data-testid={`footer-nav-${String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    className="group relative inline-flex items-center py-1 text-sm text-white/50 transition-colors duration-300 hover:text-white"
  >
    <span className="mr-0 h-px w-0 bg-brand-orange transition-all duration-300 group-hover:mr-2 group-hover:w-3" aria-hidden="true" />
    {children}
  </Link>
);

/** A stacked "Need help?" contact line — label, then value(s), separated by a divider above (not below), so the first block in a stack has no leading rule. */
const ContactBlock = ({ label, children, testId }) => (
  <div className="border-t border-white/10 pt-5 first:border-t-0 first:pt-0" data-testid={testId}>
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">{label}</p>
    <div className="mt-2 text-sm leading-relaxed text-white/70">{children}</div>
  </div>
);

const SocialLink = ({ url, icon: Icon, label }) => (
  <motion.a
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.92 }}
    href={url}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    data-testid={`social-${label.toLowerCase()}`}
    className="group relative flex h-11 w-11 items-center justify-center border border-white/10 text-white/50 transition-all duration-300 hover:border-brand-orange hover:text-brand-orange hover:shadow-[0_0_24px_-6px_rgba(255,85,0,0.5)]"
  >
    <Icon className="h-4 w-4" strokeWidth={1.75} />
    <span
      className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      aria-hidden="true"
    >
      {label}
    </span>
  </motion.a>
);

export default function Footer() {
  const { openModal: openBookingModal } = useBookingModal();
  const [settings, setSettings] = useState(FALLBACK);

  useEffect(() => {
    axios.get(`${API}/footer`).then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const { company, socials = {}, copyright } = settings;
  const socialsSet = Object.entries(socials).filter(([, url]) => url);
  const whatsappHref = `https://wa.me/${(company?.phone || "").replace(/[^0-9]/g, "")}`;

  return (
    <footer data-testid="site-footer" className="relative overflow-hidden bg-brand-ink text-white">
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="h-px w-full bg-gradient-to-r from-transparent via-brand-orange/60 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-brand-blue/10 blur-[140px]" aria-hidden="true" />
      <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-brand-orange/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 md:px-10 md:pt-24">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <Logo height={26} testId="footer-logo" />
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50">
                A full-spectrum technology company — strategy, engineering, AI, data, and
                infrastructure delivered by one team, start to finish.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openBookingModal}
                  data-testid="footer-book-call"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#0052cc]"
                >
                  <Calendar className="h-4 w-4" />
                  Book a free call
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="footer-whatsapp-us"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300"
                  style={{ backgroundColor: `#${siWhatsapp.hex}` }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" role="img" aria-hidden="true">
                    <path d={siWhatsapp.path} />
                  </svg>
                  WhatsApp Us
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-9 space-y-5" data-testid="company-info">
                <ContactBlock label="General Support" testId="info-support">
                  <a href={`tel:${(company?.phone || "").replace(/\s/g, "")}`} className="transition-colors duration-300 hover:text-brand-orange">
                    {company?.phone}
                  </a>
                  <span className="mx-2 text-white/20">|</span>
                  <a href={`mailto:${company?.support_email}`} className="transition-colors duration-300 hover:text-brand-orange">
                    {company?.support_email}
                  </a>
                </ContactBlock>
                <ContactBlock label="Sales Inquiries" testId="info-sales">
                  <a href={`mailto:${company?.sales_email}`} className="transition-colors duration-300 hover:text-brand-orange">
                    {company?.sales_email}
                  </a>
                </ContactBlock>
                <ContactBlock label="Registered Office" testId="info-address">
                  {company?.address1}
                </ContactBlock>
              </div>
            </Reveal>

            {socialsSet.length > 0 && (
              <Reveal delay={0.15}>
                <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5" data-testid="social-links">
                  {socialsSet.map(([key, url]) => {
                    const Icon = SOCIAL_ICONS[key];
                    if (!Icon) return null;
                    return <SocialLink key={key} url={url} icon={Icon} label={key} />;
                  })}
                </div>
              </Reveal>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4" data-testid="footer-menu">
              {FOOTER_LINK_GROUPS.map((group, gi) => (
                <Reveal key={group.title} delay={0.05 * gi}>
                  <div data-testid={`footer-group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    <p className="text-sm font-bold uppercase tracking-[0.1em] text-white">{group.title}</p>
                    <ul className="mt-5 space-y-2.5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <FooterLink to={link.to}>{link.label}</FooterLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden bg-brand-ink py-16" data-testid="footer-business-units">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-brand-orange/10 blur-[130px]" aria-hidden="true" />
        <div className="absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-brand-blue/10 blur-[130px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-[90rem] px-6 md:px-10">
          <Reveal>
            <p className="font-display text-sm font-semibold text-white/80 md:text-base">
              Products we design, build, and run <span className="text-brand-orange">ourselves.</span>
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.id} delay={0.06 * i}>
                <Link
                  href="/products"
                  data-testid={`footer-business-unit-${p.id}`}
                  className="group relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-brand-orange/30 bg-white/[0.04] px-8 py-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange hover:shadow-[0_20px_50px_-15px_rgba(255,85,0,0.35)] sm:flex-row sm:items-center"
                >
                  <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-opacity duration-300 group-hover:opacity-70" aria-hidden="true" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-orange/0 via-brand-orange/0 to-brand-orange/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                  <span className="relative font-display text-2xl font-black tracking-tight text-white md:text-3xl">
                    {p.name}
                    <span className="text-brand-orange">.</span>
                  </span>
                  <span className="relative inline-flex shrink-0 items-center gap-2 text-sm font-medium text-white/70 underline decoration-white/30 underline-offset-4 transition-colors duration-300 group-hover:text-brand-orange group-hover:decoration-brand-orange/60">
                    Know more about {p.name}
                    <ArrowRight className="h-3.5 w-3.5 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/50" data-testid="footer-copyright">{copyright}</p>
            <div className="mt-4 space-y-0.5 text-sm text-white/35" data-testid="footer-legal-entity">
              <p>CIN: {company?.cin}</p>
              <p>GST: {company?.gst}</p>
            </div>
          </div>

          {socialsSet.length > 0 && (
            <div className="flex items-center gap-3" data-testid="footer-bottom-social-links">
              {socialsSet.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key];
                if (!Icon) return null;
                return <SocialLink key={key} url={url} icon={Icon} label={key} />;
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
