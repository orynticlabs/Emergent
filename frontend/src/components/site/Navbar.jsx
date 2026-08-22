import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, ChevronDown, ArrowRight } from "lucide-react";
import { SERVICES, PRODUCTS, INDUSTRIES } from "@/data/content";
import { EASE } from "@/components/site/Reveal";
import Logo from "@/components/site/Logo";

const DROPDOWNS = {
  services: {
    label: "Services",
    to: "/services",
    heading: "What we do — 8 service practices",
    panelClass: "w-[640px]",
    footer: { label: "View all services", to: "/services" },
    items: SERVICES.map((s) => ({ to: "/services", icon: s.icon, title: s.title, desc: s.blurb.split("—")[0].trim() })),
    cols: "grid-cols-2",
  },
  products: {
    label: "Products",
    to: "/products",
    heading: "Our proprietary product suite",
    panelClass: "w-[720px]",
    footer: { label: "Explore all products", to: "/products" },
    items: PRODUCTS.map((p) => ({ to: "/products", title: p.name, desc: p.tagline, badge: true })),
    cols: "grid-cols-3",
  },
  industries: {
    label: "Industries",
    to: "/industries",
    heading: "Industries we serve",
    panelClass: "w-[680px]",
    footer: { label: "Check all industries", to: "/industries" },
    items: INDUSTRIES.map((ind) => ({ to: "/industries", title: ind.name })),
    cols: "grid-cols-3",
  },
};

const PLAIN_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/stack", label: "Stack" },
];

const ANNOUNCEMENTS = [
  { tag: "NEW", tagCls: "bg-brand-orange", text: "OryAI agent orchestration 2.0 is now live in production", link: "/products", cta: "Explore" },
  { tag: "OFFER", tagCls: "bg-brand-blue", text: "Free AI-readiness audit for engagements started this quarter", link: "/contact", cta: "Claim Audit" },
  { tag: "INSIGHT", tagCls: "bg-white/15", text: "Why RAG beats fine-tuning for most enterprise knowledge systems", link: "/stack", cta: "Read" },
  { tag: "NEW", tagCls: "bg-brand-orange", text: "PerformX HRMS — direct salary disbursement now available", link: "/products", cta: "See PerformX" },
];

function AnnouncementBar({ scrolled }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const item = ANNOUNCEMENTS[index];

  return (
    <div
      data-testid="announcement-bar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative overflow-hidden transition-all duration-500 ${
        scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
      } border-b border-white/10 bg-[#0B0B0E]`}
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-center px-6 md:px-10">
        <span className="relative mr-3 hidden h-1.5 w-1.5 sm:block" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange" />
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            data-testid="announcement-item"
            className="flex min-w-0 items-center gap-3"
          >
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-white ${item.tagCls}`}>
              {item.tag}
            </span>
            <span className="max-w-[46vw] truncate text-xs text-white/75 md:max-w-none">{item.text}</span>
            <Link
              to={item.link}
              data-testid="announcement-cta"
              className="group hidden shrink-0 items-center gap-1 text-[11px] font-bold uppercase italic tracking-widest text-brand-orange underline decoration-brand-orange/60 underline-offset-4 transition-colors duration-300 hover:decoration-brand-orange sm:inline-flex"
            >
              {item.cta}
              <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-4 flex items-center gap-2 md:right-10">
          <div className="hidden items-center gap-1.5 md:flex" data-testid="announcement-dots">
            {ANNOUNCEMENTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                data-testid={`announcement-dot-${i}`}
                aria-label={`Announcement ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-brand-orange" : "w-1 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MegaPanel({ config, menuKey }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.28, ease: EASE }}
      data-testid={`mega-panel-${menuKey}`}
      className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 ${config.panelClass}`}
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090909]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        <div className="h-px w-full bg-gradient-to-r from-brand-orange via-white/25 to-brand-blue" aria-hidden="true" />
        <p className="px-7 pt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">{config.heading}</p>
        <div className={`grid ${config.cols} gap-1 p-4`}>
          {config.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                data-testid={`mega-item-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="group/item flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:translate-x-1 hover:bg-white/[0.05]"
              >
                {Icon ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-colors duration-300 group-hover/item:border-brand-orange/40 group-hover/item:bg-brand-orange/10">
                    <Icon className="h-[18px] w-[18px] text-brand-blue transition-colors duration-300 group-hover/item:text-brand-orange" strokeWidth={1.5} />
                  </span>
                ) : (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange/70 transition-all duration-300 group-hover/item:bg-brand-orange" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white transition-colors duration-300 group-hover/item:text-brand-orange">
                    {item.title}
                  </span>
                  {item.desc && (
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-white/45">{item.desc}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
        <Link
          to={config.footer.to}
          className="group flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-orange"
        >
          {config.footer.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

const NavUnderline = ({ active }) => (
  <span
    aria-hidden="true"
    className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-brand-orange transition-transform duration-300 ease-out ${
      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
    }`}
  />
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setActiveMenu(null);
    setExpanded(null);
  }, [pathname]);

  return (
    <>
      <header
        data-testid="site-navbar"
        onMouseLeave={() => setActiveMenu(null)}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled || activeMenu ? "border-b border-white/10 bg-brand-ink/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <AnnouncementBar scrolled={scrolled} />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10 md:py-5">
          <div onMouseEnter={() => setActiveMenu(null)}>
            <Logo testId="nav-logo" />
          </div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {PLAIN_LINKS.slice(0, 2).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onMouseEnter={() => setActiveMenu(null)}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `group relative py-1 text-sm font-medium tracking-wide transition-colors duration-300 ${
                    isActive ? "text-brand-orange" : "text-white/70 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <NavUnderline active={isActive} />
                  </>
                )}
              </NavLink>
            ))}

            {Object.entries(DROPDOWNS).map(([key, config]) => (
              <div key={key} className="static">
                <button
                  data-testid={`nav-dropdown-${key}`}
                  onMouseEnter={() => setActiveMenu(key)}
                  onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                  className={`group relative flex items-center gap-1.5 py-1 text-sm font-medium tracking-wide transition-colors duration-300 ${
                    activeMenu === key || pathname === config.to ? "text-brand-orange" : "text-white/70 hover:text-white"
                  }`}
                >
                  {config.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${activeMenu === key ? "rotate-180" : ""}`} />
                  <NavUnderline active={activeMenu === key || pathname === config.to} />
                </button>
                <AnimatePresence>
                  {activeMenu === key && <MegaPanel config={config} menuKey={key} />}
                </AnimatePresence>
              </div>
            ))}

            <NavLink
              to="/stack"
              onMouseEnter={() => setActiveMenu(null)}
              data-testid="nav-link-stack"
              className={({ isActive }) =>
                `group relative py-1 text-sm font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? "text-brand-orange" : "text-white/70 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Stack
                  <NavUnderline active={isActive} />
                </>
              )}
            </NavLink>
          </nav>

          <div className="hidden lg:block" onMouseEnter={() => setActiveMenu(null)}>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                to="/contact"
                data-testid="nav-cta-button"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#e04a00]"
              >
                Consult Our Strategy Team
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </div>

          <button
            data-testid="nav-menu-toggle"
            onClick={() => setOpen(!open)}
            className="text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="nav-mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-brand-ink/95 px-8 pb-16 pt-24 backdrop-blur-2xl lg:hidden"
          >
            {[...PLAIN_LINKS, { to: "/contact", label: "Contact" }].map((link, i) => (
              <motion.div key={link.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE }}>
                <NavLink
                  to={link.to}
                  data-testid={`nav-mobile-link-${link.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `block border-b border-white/10 py-4 font-display text-3xl font-bold tracking-tight ${
                      isActive ? "text-brand-orange" : "text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}

            {Object.entries(DROPDOWNS).map(([key, config], i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * (i + 4), duration: 0.4, ease: EASE }} className="border-b border-white/10">
                <button
                  data-testid={`nav-mobile-dropdown-${key}`}
                  onClick={() => setExpanded(expanded === key ? null : key)}
                  className="flex w-full items-center justify-between py-4 font-display text-3xl font-bold tracking-tight text-white"
                >
                  {config.label}
                  <ChevronDown className={`h-6 w-6 text-brand-orange transition-transform duration-300 ${expanded === key ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expanded === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 pl-2">
                        {config.items.map((item) => (
                          <Link key={item.title} to={item.to} className="block py-2 text-base text-white/60 transition-colors duration-200 hover:text-brand-orange">
                            {item.title}
                          </Link>
                        ))}
                        <Link to={config.footer.to} className="mt-2 block text-sm font-bold uppercase tracking-widest text-brand-orange">
                          {config.footer.label} →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
