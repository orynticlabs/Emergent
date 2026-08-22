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
- Announcement bar at very top: rotating NEW/OFFER/INSIGHT messages with vertical up-down animation, tag chips, progress dots, pause-on-hover, dismiss button; collapses on scroll (content in Navbar.jsx ANNOUNCEMENTS)
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
