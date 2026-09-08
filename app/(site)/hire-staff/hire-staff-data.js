// Plain data module (no "use client") so both the server page.jsx (JSON-LD)
// and client components (HireStaffClient, HireStaffRequestModal) can import
// the same arrays - a data export from a "use client" module can't be
// safely consumed by a server component.

const PEXELS_AVATAR = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300`;

export const ROLES = [
  { id: 1, title: "Frontend Engineer", tags: ["React", "Next.js", "TypeScript"], blurb: "Ships production UI, not just components - performance, accessibility, and design fidelity included.", image: PEXELS_AVATAR(220453) },
  { id: 2, title: "Backend Engineer", tags: ["Node.js", "FastAPI", "PostgreSQL"], blurb: "Designs APIs and data models that hold up under real production load, not just a demo.", image: PEXELS_AVATAR(1043471) },
  { id: 3, title: "Mobile Engineer", tags: ["React Native", "Swift", "Kotlin"], blurb: "Native or cross-platform, chosen for your product - not a default they reach for every time.", image: PEXELS_AVATAR(733872) },
  { id: 4, title: "AI/ML Engineer", tags: ["PyTorch", "LangChain", "RAG"], blurb: "Builds and ships trained models and agent systems into production, not just notebooks.", image: PEXELS_AVATAR(415829) },
  { id: 5, title: "DevOps Engineer", tags: ["AWS", "Kubernetes", "Terraform"], blurb: "Owns CI/CD, observability, and infrastructure-as-code so releases stop being an event.", image: PEXELS_AVATAR(1239291) },
  { id: 6, title: "QA Engineer", tags: ["Playwright", "Cypress", "Test Strategy"], blurb: "Builds a real test strategy and automation suite, not just manual click-throughs.", image: PEXELS_AVATAR(1181686) },
];

export const ENGAGEMENT_MODELS = [
  {
    title: "Staff Augmentation",
    tagline: "Add vetted engineers directly into your existing team.",
    features: ["Works your hours and your tools", "Reports into your PM or lead", "Billed monthly, per engineer", "Scale headcount up or down anytime"],
    cta: "Hire engineers",
  },
  {
    title: "Dedicated Team",
    tagline: "A full cross-functional pod built around your roadmap.",
    features: ["Engineers, PM, and QA in one pod", "Sprint planning included", "Direct Slack & standup access", "Single accountable team, not fragments"],
    cta: "Build a team",
    highlighted: true,
  },
  {
    title: "Project-Based",
    tagline: "Fixed scope, fixed timeline, fixed price.",
    features: ["Documented scope of work upfront", "Milestone-based delivery", "No hourly billing surprises", "Best for a clearly defined build"],
    cta: "Get a quote",
  },
];

export const HIRE_STAFF_FAQS = [
  {
    q: "How fast can I actually get an engineer working?",
    a: "Most engagements receive a candidate shortlist within 48 hours of a brief, and engineers typically onboard and start shipping inside the first week. Urgent requirements can be accelerated once scope is confirmed.",
  },
  {
    q: "Do I own the code and IP the engineer produces?",
    a: "Yes. 100% of the code, designs, documentation, and intellectual property produced during the engagement belong entirely to your company from day one.",
  },
  {
    q: "What happens if an engineer isn't the right fit?",
    a: "We replace the engineer promptly at zero additional cost. Our priority is long-term delivery velocity and cultural fit, not billing for a mismatch.",
  },
  {
    q: "How is billing structured?",
    a: "Staff augmentation and dedicated pods are billed on a predictable monthly retainer per engineer. Fixed-scope projects follow milestone-based billing with no hourly surprises.",
  },
  {
    q: "Will the engineer actually work in my timezone?",
    a: "Yes. Dedicated working hour overlap with your core team hours (US, UK, Europe, or APAC) is agreed upon before onboarding starts.",
  },
  {
    q: "Is there a minimum commitment period?",
    a: "No long-term lock-in. You can scale capacity up, adjust roles, or wind down month-to-month with standard notice.",
  },
];
