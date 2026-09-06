"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { PRODUCTS } from "@site/data/content";
import { EASE } from "@site/components/site/Reveal";
import Logo from "@site/components/site/Logo";
import {
  NavBody,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@site/components/ui/resizable-navbar";
import { Menu, MenuItem, HoveredLink, ProductItem } from "@site/components/ui/navbar-menu";
import { useBookingModal } from "@site/components/site/BookingModalContext";

const DROPDOWNS = {
  products: {
    label: "Products",
    to: "/products",
    type: "products",
    items: PRODUCTS.map((p) => ({ to: "/products", title: p.name, desc: p.tagline, src: p.image })),
  },
};

const PLAIN_LINKS = [
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/hire-staff", label: "Hire Staff" },
];

const ANNOUNCEMENT_COLOR_CLASS = { orange: "bg-brand-orange", blue: "bg-brand-blue", neutral: "bg-white/15" };

function useAnnouncements() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    // Relative path — this API route is served by this same Next.js app,
    // not a separate backend, so it must always resolve against whatever
    // origin the page itself was loaded from (localhost in dev, the deployed
    // domain in production). Prefixing with NEXT_PUBLIC_BACKEND_URL pointed
    // this at a stale, unrelated deployment and broke it silently.
    fetch(`/api/orycms/announcements/public`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Announcements fetch failed: ${res.status}`);
        return res.json();
      })
      .then((body) => {
        if (cancelled || !body?.success || !Array.isArray(body.data) || body.data.length === 0) return;
        setItems(
          body.data.map((a) => ({
            tag: a.tag,
            tagCls: ANNOUNCEMENT_COLOR_CLASS[a.color] || "bg-white/15",
            text: a.message,
            link: a.link || "/contact-us",
            cta: a.ctaLabel || "Learn more",
          })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}

function AnnouncementBar() {
  const announcements = useAnnouncements();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [announcements]);

  useEffect(() => {
    if (paused || announcements.length === 0) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 4500);
    return () => clearInterval(timer);
  }, [paused, announcements.length]);

  if (announcements.length === 0) return null;

  const item = announcements[index % announcements.length];

  return (
    <div
      data-testid="announcement-bar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden border-b border-white/10 bg-[#0B0B0E]"
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
              href={item.link}
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
            {announcements.map((_, i) => (
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

function MegaPanelContent({ config }) {
  if (config.type === "products") {
    return (
      <div className="grid grid-cols-2 gap-8 p-4 text-sm">
        {config.items.map((item) => (
          <ProductItem key={item.title} title={item.title} description={item.desc} href={item.to} src={item.src} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 text-sm">
      {config.items.map((item) => (
        <HoveredLink key={item.title} href={item.to}>
          {item.title}
        </HoveredLink>
      ))}
    </div>
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
  const { openModal: openBookingModal } = useBookingModal();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
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
    <div data-testid="site-navbar" className="fixed inset-x-0 top-0 z-50">
      <AnnouncementBar />

      <div className="px-4 pt-1 md:px-6">
        {/* Desktop */}
        <NavBody visible={scrolled} onMouseLeave={() => setActiveMenu(null)}>
          <NavbarLogo>
            <Logo testId="nav-logo" />
          </NavbarLogo>

          <div className="absolute inset-0 hidden items-center justify-center lg:flex" aria-label="Primary">
            <Menu setActive={setActiveMenu} className="gap-7">
              {PLAIN_LINKS.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    onMouseEnter={() => setActiveMenu(null)}
                    data-testid={`nav-link-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className={`group relative py-1 text-sm font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? "text-brand-orange" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                    <NavUnderline active={isActive} />
                  </Link>
                );
              })}

              {Object.entries(DROPDOWNS).map(([key, config]) => (
                <MenuItem
                  key={key}
                  setActive={setActiveMenu}
                  active={activeMenu}
                  id={key}
                  label={
                    <span
                      data-testid={`nav-dropdown-${key}`}
                      className={`group relative flex items-center gap-1.5 py-1 text-sm font-medium tracking-wide transition-colors duration-300 ${
                        activeMenu === key || pathname === config.to ? "text-brand-orange" : "text-white/70 hover:text-white"
                      }`}
                    >
                      {config.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${activeMenu === key ? "rotate-180" : ""}`} />
                      <NavUnderline active={activeMenu === key || pathname === config.to} />
                    </span>
                  }
                >
                  <MegaPanelContent config={config} />
                </MenuItem>
              ))}
            </Menu>
          </div>

          <div onMouseEnter={() => setActiveMenu(null)} className="flex items-center gap-3">
            <NavbarButton as="button" type="button" onClick={openBookingModal} variant="secondary" data-testid="nav-book-call-button">
              Book a Call
            </NavbarButton>
            <NavbarButton href="/contact-us" data-testid="nav-cta-button">
              Consult Our Strategy Team
              <ArrowUpRight className="h-4 w-4" />
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile */}
        <MobileNav visible={scrolled}>
          <MobileNavHeader>
            <NavbarLogo>
              <Logo testId="nav-logo-mobile" />
            </NavbarLogo>
            <MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
          </MobileNavHeader>

          <MobileNavMenu isOpen={open}>
            {[...PLAIN_LINKS, { to: "/contact-us", label: "Contact" }].map((link) => (
              <Link
                key={link.to}
                href={link.to}
                data-testid={`nav-mobile-link-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`block w-full border-b border-white/10 py-3.5 text-lg font-semibold tracking-tight ${
                  pathname === link.to ? "text-brand-orange" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {Object.entries(DROPDOWNS).map(([key, config]) => (
              <div key={key} className="w-full border-b border-white/10">
                <button
                  data-testid={`nav-mobile-dropdown-${key}`}
                  onClick={() => setExpanded(expanded === key ? null : key)}
                  className="flex w-full items-center justify-between py-3.5 text-lg font-semibold tracking-tight text-white"
                >
                  {config.label}
                  <ChevronDown className={`h-5 w-5 text-brand-orange transition-transform duration-300 ${expanded === key ? "rotate-180" : ""}`} />
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
                      <div className="pb-4 pl-1">
                        {config.items.map((item) => (
                          <Link key={item.title} href={item.to} className="block py-1.5 text-sm text-white/60 transition-colors duration-200 hover:text-brand-orange">
                            {item.title}
                          </Link>
                        ))}
                        <Link href={config.to} className="mt-1.5 block text-xs font-bold uppercase tracking-widest text-brand-orange">
                          View all {config.label.toLowerCase()} →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <NavbarButton
              as="button"
              type="button"
              variant="secondary"
              className="mt-2 w-full justify-center"
              onClick={() => {
                setOpen(false);
                openBookingModal();
              }}
              data-testid="nav-mobile-book-call-button"
            >
              Book a Call
            </NavbarButton>
            <NavbarButton href="/contact-us" className="mt-2.5 w-full justify-center" onClick={() => setOpen(false)}>
              Consult Our Strategy Team
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </div>
    </div>
  );
}
