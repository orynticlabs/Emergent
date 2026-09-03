"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Loader2, CheckCircle2, Linkedin, Instagram, Facebook, Twitter, Youtube,
} from "lucide-react";
import { Reveal } from "@site/components/site/Reveal";
import { SERVICES, INDUSTRIES, PRODUCTS } from "@site/data/content";
import { siteAlertToast } from "@site/components/ui/site-alert-toast";

// Relative — these routes are served by this same Next.js app, so they must
// resolve against whatever origin the page was loaded from, not a hardcoded
// (and easily stale) separate deployment URL.
const API = `/api`;

const FALLBACK = {
  company: {
    email: "hello@orynticlabs.com",
    sales_email: "sales@orynticlabs.com",
    support_email: "support@orynticlabs.com",
    phone: "+91 79017 17617",
    address1: "Ward 14, Main Stand, Mangawan, Rewa, Madhya Pradesh 486111, India",
    address2: "OrynticLabs Private Limited, 6th Venture X, Landmark, Sector 67, Gurugram, Haryana 122101, India",
    cin: "U62011MP2026PTC085165",
    gst: "Available on request",
  },
  newsletter: {
    title: "Stay in the Loop",
    text: "Get OrynticLabs updates, technology insights, product announcements, and company news — delivered occasionally. No noise, no spam.",
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
    title: "Company",
    links: [
      ...PRODUCTS.map((p) => ({ label: p.name, to: "/products" })),
      { label: "Portfolio", to: "/portfolio" },
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

const InfoRow = ({ label, value, href, testId, delay }) => (
  <Reveal delay={delay}>
    <div
      className="group flex flex-col gap-1 border-b border-white/[0.07] py-4 transition-colors duration-300 hover:border-brand-orange/40 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
      data-testid={testId}
    >
      <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-orange/70">{label}</p>
      {href ? (
        <a
          href={href}
          className="text-sm font-medium leading-relaxed text-white/80 transition-colors duration-300 hover:text-brand-orange sm:text-right"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium leading-relaxed text-white/80 sm:max-w-md sm:text-right">{value}</p>
      )}
    </div>
  </Reveal>
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
  const [settings, setSettings] = useState(FALLBACK);
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  useEffect(() => {
    axios.get(`${API}/footer`).then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      siteAlertToast({ title: "Enter a valid email", description: "Please double-check the address and try again.", variant: "error" });
      return;
    }
    setState("loading");
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email });
      setState("success");
      siteAlertToast({ title: "You're on the list", description: "Check your inbox for a welcome email." });
      setEmail("");
      setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      siteAlertToast({ title: "Subscription failed", description: "Please try again in a moment.", variant: "error" });
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const { company, newsletter, socials = {}, certificates = [], legal_links = [], copyright } = settings;
  const socialsSet = Object.entries(socials).filter(([, url]) => url);
  const bottomBadges = certificates.slice(1);

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
          <div className="lg:col-span-5">
            <Reveal>
              <div data-testid="newsletter-block">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">{newsletter?.title || "Stay in the Loop"}</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">{newsletter?.text}</p>
                <form onSubmit={subscribe} data-testid="newsletter-form" className="mt-7 flex w-full items-end gap-4" noValidate>
                  <motion.div
                    animate={state === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="group relative w-full"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      data-testid="newsletter-email-input"
                      className={`w-full border-b bg-transparent px-0 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors duration-300 ${
                        state === "error" ? "border-red-500/70" : state === "success" ? "border-emerald-500/70" : "border-white/15 focus:border-brand-orange"
                      }`}
                      suppressHydrationWarning
                    />
                    <span
                      className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-brand-orange transition-all duration-500 group-focus-within:w-full"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={state === "loading"}
                    data-testid="newsletter-submit-button"
                    className="inline-flex shrink-0 items-center gap-2 border-b border-brand-orange pb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brand-orange transition-colors duration-300 hover:text-white disabled:opacity-60"
                  >
                    <AnimatePresence mode="wait">
                      {state === "loading" ? (
                        <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </motion.span>
                      ) : state === "success" ? (
                        <motion.span key="s" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      ) : (
                        <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {state === "success" ? "Subscribed" : "Subscribe"}
                  </motion.button>
                </form>
              </div>
            </Reveal>

            {certificates.length > 0 && (
              <Reveal delay={0.1}>
                <div className="mt-10 border-t border-white/10 pt-8" data-testid="footer-certificates">
                  <motion.div
                    whileHover={{ y: -4 }}
                    title={certificates[0].label}
                    data-testid={`certificate-${certificates[0].label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="block w-full"
                  >
                    <img
                      src={certificates[0].image}
                      alt={certificates[0].label}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full object-contain"
                    />
                  </motion.div>
                </div>
              </Reveal>
            )}

            {socialsSet.length > 0 && (
              <Reveal delay={0.15}>
                <div className="mt-10 border-t border-white/10 pt-8" data-testid="social-links">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Follow Us</p>
                  <div className="mt-5 flex items-center gap-3">
                    {socialsSet.map(([key, url]) => {
                      const Icon = SOCIAL_ICONS[key];
                      if (!Icon) return null;
                      return <SocialLink key={key} url={url} icon={Icon} label={key} />;
                    })}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-16">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Company Information</p>
            </Reveal>
            <div className="mt-6 border-t border-white/10" data-testid="company-info">
              <InfoRow label="Sales Email" value={company?.sales_email} href={`mailto:${company?.sales_email}`} testId="info-sales-email" delay={0.05} />
              <InfoRow label="Support Email" value={company?.support_email} href={`mailto:${company?.support_email}`} testId="info-support-email" delay={0.1} />
              <InfoRow label="Contact Number" value={company?.phone} href={`tel:${(company?.phone || "").replace(/\s/g, "")}`} testId="info-phone" delay={0.15} />
              <InfoRow label="CIN" value={company?.cin} testId="info-cin" delay={0.2} />
              <InfoRow label="Head Office" value={company?.address1} testId="info-address-1" delay={0.25} />
              <InfoRow label="Corporate Office" value={company?.address2} testId="info-address-2" delay={0.3} />
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-14" data-testid="footer-menu">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
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

      <div className="relative mt-16 overflow-hidden bg-brand-ink py-16" data-testid="footer-business-units">
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
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap items-center gap-x-7 gap-y-3" aria-label="Legal" data-testid="footer-legal-links">
              {legal_links.map((link) => (
                <FooterLink key={link.label} to={link.url}>{link.label}</FooterLink>
              ))}
            </nav>
            {bottomBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-6" data-testid="footer-badges">
                {bottomBadges.map((badge) => (
                  <motion.img
                    key={badge.label}
                    whileHover={{ y: -3 }}
                    src={badge.image}
                    alt={badge.label}
                    title={badge.label}
                    data-testid={`footer-badge-${badge.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="h-10 w-auto object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-8 text-xs text-white/35" data-testid="footer-copyright">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
