# OrynticLabs Website — PRD

## Original Problem Statement
Build the official OrynticLabs website with a modern, premium, futuristic visual style (black, blue, orange, white palette), smooth transitions, modern animations, interactive elements, and latest visual design trends — a high-end technology brand experience. Inspired by (not copying) appinventiv.com and apptunix.com. Content sourced from the OrynticLabs company document (services, products, technologies, industries, positioning). Must feel premium, enterprise-grade, and unique. Target: Awwwards-level craft — kinetic masked hero reveal, numbered manifesto chapters, slow editorial marquee, framer-motion scroll reveals, lenis smooth scrolling, subtle parallax hero.

## User Choices (gathered)
- Structure: multi-page site (Home covers all key sections too)
- Contact form: frontend-only demo (MOCKED, toast confirmation)
- Integration: newsletter signup via email (real — Emergent managed Resend)
- Visual: dark futuristic hero + alternating light/dark sections

## Architecture
- Frontend: React (CRA/craco) + Tailwind, framer-motion, lenis, react-fast-marquee, lucide-react, sonner
- Backend: FastAPI + MongoDB (motor), Emergent managed email proxy (httpx) with guardrail gate
- Pages: / (Home), /about, /services, /products, /industries, /stack, /contact
- Shared: Navbar (glass), Footer (newsletter form + links), Reveal/KineticLine/PageHero/SectionHead/ArrowLink helpers, Ribbon marquee, content.js data source
- Design system: /app/design_guidelines.json — Cabinet Grotesk (display) + Outfit (body); #FF5500 orange, #0066FF blue, #050505 ink, #FAFAFA paper; grain overlay; grid-line backgrounds

## User Personas
- Founder/CTO evaluating an engineering partner
- Enterprise product leader scoping AI/data/cloud work
- Potential client exploring OryAI/OryCMS/PerformX products

## Implemented (2026-08-22)
- Multi-page site with 7 routes, kinetic masked hero reveal, parallax, lenis smooth scroll
- v2 redesign (appinventiv.com-inspired): mega-menu header with hover dropdowns (Services 8, Products 3, Industries 11) + mobile accordion menu; video background hero (Pexels abstract) with kinetic headline + stats strip; homepage sections: tech ribbon marquee, "Beyond Development" 4 service-group cards, tabbed Products showcase ("Innovation, Engineered by OrynticLabs"), image-backed stats cards, OryAI ecosystem section, interactive Industries tabs with image panel, Why OrynticLabs, FAQ accordion (5 FAQs), CTA band
- CTA section v2 (2026-08-22): replaced "Ready to Build" band with apptunix-style split — left "Partner with tech catalysts who transform ideas into impact." + "Let's Talk!" with blue→orange vertical divider; right "Speak With Our Experts" glass form card (Full Name, +91 Mobile, Business Email, launch-timeline dropdown, About Project, orange Submit) on mesh background. Form is frontend demo (toast) — MOCKED, not stored
- Services section bg (2026-08-22): apptunix-style deep-navy radial mesh background with blue + orange glows (.bg-mesh-brand in index.css), glass cards with blue glow hover; client marquee base matched to #05060e for seamless flow
- Responsiveness pass (2026-08-22): fixed mobile horizontal overflow in Products showcase (min-w-0 grid fix); audited all 8 pages at 390px / 768px / 1280px / 1920px — zero horizontal overflow, mobile menu, newsletter form, and certificate layout verified on small screens
- Products showcase v2 (2026-08-22): redesigned Internal Products component — consistent light tab cards (numbered 01/02/03, orange accent bar + glow shadow + slide on active, no more white/black clash); detail panel with delivery-model chips (PaaS+Custom/SaaS + In Production), "Ideal for" callout, "What's inside" 6-feature grid + more count, dual CTAs (View Product / Discuss Fit). PRODUCTS data gained model + ideal fields
- Navbar v3 (2026-08-22): custom SVG logo (hexagon + orbit ring + orange dot, gradient orange→blue, rotates on hover) used in header/footer/admin; smooth animated orange underline on nav hover/active (no lag); mega panels now open page-centered under header (fixed position, no left/right shift) with enhanced design — gradient accent line, category heading, icon tiles, hover slide; header-level mouse-leave closes menus
- Hero v2 (2026-08-22): centered layout over video bg — medium-weight refined typography (no more ultra-bold), overline, kinetic reveal, two centered CTAs; stats strip removed from hero. Client logo marquee added right after hero ("Trusted by forward-thinking teams", blurred logos sharpen on hover, edge fades) — PLACEHOLDER wordmark logos (Quantiva, NorthPeak, etc.) to be swapped with real client logos
- Announcement bar v2 (2026-08-22): rotating NEW/OFFER/INSIGHT messages, vertical up-down animation, solid dark background, italic underlined CTA links, progress dots, pause-on-hover, no dismiss button; collapses on scroll (content in Navbar.jsx ANNOUNCEMENTS)
- Footer v5 (2026-08-22): Company Information redesigned — iconless typographic items (orange labels + separators): Sales Email sales@orynticlabs.com, Support Email support@orynticlabs.com, Contact +91 79017 17617, CIN U62011MP2026PTC085165, Head Office (Ward 14, Main Stand, Mangawan, Rewa, MP 486111), Corporate Office (6th Venture X, Landmark, Sector 67, Gurugram, Haryana 122101). Startup India certificate enlarged to full subscribe-row width (max-w-md). Admin panel has Sales/Support email fields
- Footer v4 (2026-08-22): Startup India certificate enlarged (h-28), no background tile, under newsletter on left; ISO 27001 + DMCA shown as bare images in bottom footer bar (text badge pills removed); certificate order in admin controls placement (first = large left, rest = bottom bar)
- Footer v2 (2026-08-22): 4 nav columns (Company/Services/Expertise/Technologies), company info card (email, phone, 2 addresses, CIN, GST), "Stay in the Loop" newsletter with validation + animated states, social icons (render only when URL set), bottom bar with legal links + badges + copyright — all content served from GET /api/footer
- Admin panel: /admin/login (JWT, bcrypt, 5-attempt/15-min lockout) + /admin footer manager (company info, newsletter text, socials, nav columns, legal links, badges, copyright). Admin: admin@orynticlabs.com (see /app/memory/test_credentials.md)
- Legal pages: /privacy-policy, /terms-conditions, /terms-of-service (template content — needs legal review), /sitemap
- About / Services / Products / Industries / Stack / Contact pages (v1 layouts retained)
- Newsletter: POST /api/newsletter/subscribe — stores subscriber in MongoDB + sends branded welcome email via managed Resend (verified, email_id returned)
- Contact form: frontend-only demo with success toast (MOCKED — not stored or emailed)
- data-testid coverage on interactive elements

## Backlog
- P0: Connect contact form to backend (store enquiries + email notification to sales@orynticlabs.com)
- P1: Case studies / work portfolio section
- P1: Blog/insights powered by OryCMS narrative
- P2: AI chatbot assistant for visitors
- P2: Product detail pages for OryAI/OryCMS/PerformX with demos
- P2: Careers page

## Next Tasks
1. Wire contact form to real backend + email
2. Add case studies section
3. SEO metadata per route
