import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Loader2, CheckCircle2, Linkedin, Instagram, Facebook, Twitter, Youtube,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import Logo from "@/components/site/Logo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  socials: {},
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

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    data-testid={`footer-nav-${String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    className="group relative inline-flex items-center py-1 text-sm text-white/50 transition-colors duration-300 hover:text-white"
  >
    <span className="mr-0 h-px w-0 bg-brand-orange transition-all duration-300 group-hover:mr-2 group-hover:w-3" aria-hidden="true" />
    {children}
  </Link>
);

const InfoItem = ({ label, value, href, testId }) => (
  <div className="border-b border-white/[0.07] pb-5" data-testid={testId}>
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-orange/80">{label}</p>
    {href ? (
      <a href={href} className="mt-2 block text-sm font-medium leading-relaxed text-white/85 transition-colors duration-300 hover:text-brand-orange">
        {value}
      </a>
    ) : (
      <p className="mt-2 text-sm font-medium leading-relaxed text-white/85">{value}</p>
    )}
  </div>
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
      toast.error("Please enter a valid email address.");
      return;
    }
    setState("loading");
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email });
      setState("success");
      toast.success("You're on the list. Check your inbox for a welcome email.");
      setEmail("");
      setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      toast.error("Subscription failed. Please try again.");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const { company, newsletter, socials = {}, columns = [], certificates = [], legal_links = [], copyright } = settings;
  const socialsSet = Object.entries(socials).filter(([, url]) => url);
  const bottomBadges = certificates.slice(1);

  return (
    <footer data-testid="site-footer" className="relative overflow-hidden bg-brand-ink text-white">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-orange/60 to-transparent" aria-hidden="true" />
      <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-brand-blue/10 blur-[140px]" aria-hidden="true" />
      <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-brand-orange/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 md:px-10 md:pt-24">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Logo textClass="text-2xl" markSize={38} testId="footer-logo" />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
                A full-spectrum technology company engineering intelligent software —
                web, mobile, AI, data, cloud, and design.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10" data-testid="newsletter-block">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">{newsletter?.title || "Stay in the Loop"}</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">{newsletter?.text}</p>
                <form onSubmit={subscribe} data-testid="newsletter-form" className="mt-6 flex max-w-md gap-3" noValidate>
                  <motion.div
                    animate={state === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      data-testid="newsletter-email-input"
                      className={`w-full rounded-full border bg-white/5 px-6 py-3.5 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur-sm transition-colors duration-300 ${
                        state === "error" ? "border-red-500/70" : state === "success" ? "border-emerald-500/70" : "border-white/15 focus:border-brand-orange"
                      }`}
                    />
                  </motion.div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={state === "loading"}
                    data-testid="newsletter-submit-button"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
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
              <Reveal delay={0.2}>
                <div className="mt-10" data-testid="footer-certificates">
                  <motion.div
                    whileHover={{ y: -4 }}
                    title={certificates[0].label}
                    data-testid={`certificate-${certificates[0].label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="max-w-md"
                  >
                    <img
                      src={certificates[0].image}
                      alt={certificates[0].label}
                      className="h-auto w-full rounded-lg object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.5)] transition-[filter] duration-300 hover:drop-shadow-[0_0_32px_rgba(0,102,255,0.35)]"
                    />
                  </motion.div>
                </div>
              </Reveal>
            )}

            {socialsSet.length > 0 && (
              <Reveal delay={0.25}>
                <div className="mt-10 flex items-center gap-3" data-testid="social-links">
                  {socialsSet.map(([key, url]) => {
                    const Icon = SOCIAL_ICONS[key];
                    if (!Icon) return null;
                    return (
                      <motion.a
                        key={key}
                        whileHover={{ y: -3 }}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={key}
                        data-testid={`social-${key}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all duration-300 hover:border-brand-orange hover:text-brand-orange hover:shadow-[0_0_24px_-6px_rgba(255,85,0,0.5)]"
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </motion.a>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Company Information</p>
            </Reveal>
            <div className="mt-8 grid gap-x-12 gap-y-7 sm:grid-cols-2" data-testid="company-info">
              <Reveal delay={0.05}><InfoItem label="Sales Email" value={company?.sales_email} href={`mailto:${company?.sales_email}`} testId="info-sales-email" /></Reveal>
              <Reveal delay={0.1}><InfoItem label="Support Email" value={company?.support_email} href={`mailto:${company?.support_email}`} testId="info-support-email" /></Reveal>
              <Reveal delay={0.15}><InfoItem label="Contact Number" value={company?.phone} href={`tel:${(company?.phone || "").replace(/\s/g, "")}`} testId="info-phone" /></Reveal>
              <Reveal delay={0.2}><InfoItem label="CIN" value={company?.cin} testId="info-cin" /></Reveal>
              <Reveal delay={0.25}><InfoItem label="Head Office" value={company?.address1} testId="info-address-1" /></Reveal>
              <Reveal delay={0.3}><InfoItem label="Corporate Office" value={company?.address2} testId="info-address-2" /></Reveal>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-14">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
            {columns.map((col, i) => (
              <Reveal key={col.title} delay={0.05 * i}>
                <div data-testid={`footer-column-${col.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">{col.title}</p>
                  <ul className="mt-5 space-y-2.5">
                    {(col.links || []).map((link) => (
                      <li key={link.label}>
                        <FooterLink to={link.url}>{link.label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
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
