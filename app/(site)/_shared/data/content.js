import {
  Globe, Layers, Braces, Smartphone, BrainCircuit, BarChart3, Cloud, PenTool,
} from "lucide-react";

export const IMAGES = {
  hero: "https://images.pexels.com/photos/30547579/pexels-photo-30547579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  about: "https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  culture: "https://images.pexels.com/photos/3912478/pexels-photo-3912478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ai: "https://images.pexels.com/photos/8386437/pexels-photo-8386437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  dashboard: "https://images.pexels.com/photos/27141316/pexels-photo-27141316.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  architecture: "https://images.pexels.com/photos/33719029/pexels-photo-33719029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  datacenter: "https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  tech: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

const PEXELS_AVATAR = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100`;

// Who actually picks up - the real roles on a staff-augmentation or delivery
// team, not invented individuals. Shown as roles, with stock Pexels headshots
// standing in for photos (same placeholder-image convention as the rest of
// the marketing site) since these aren't named team members. Shared across
// every "meet the team" strip on the site (home + about) so they stay in sync.
export const TEAM_ROLES = [
  { id: 1, name: "Frontend & Backend", designation: "Full-stack engineers", image: PEXELS_AVATAR(220453), className: "bg-brand-orange" },
  { id: 2, name: "Mobile", designation: "iOS, Android & cross-platform", image: PEXELS_AVATAR(1043471), className: "bg-brand-blue" },
  { id: 3, name: "AI & ML", designation: "Agents, RAG, model training", image: PEXELS_AVATAR(733872), className: "bg-violet-500" },
  { id: 4, name: "Cloud & DevOps", designation: "AWS, GCP, Azure, CI/CD", image: PEXELS_AVATAR(415829), className: "bg-sky-500" },
  { id: 5, name: "Product Design", designation: "UI/UX, design systems", image: PEXELS_AVATAR(1239291), className: "bg-pink-500" },
  { id: 6, name: "QA", designation: "Testing & quality assurance", image: PEXELS_AVATAR(1181686), className: "bg-emerald-500" },
];

export const CLIENTS = [
  { name: "QUANTIVA", cls: "font-display font-bold tracking-[0.22em]" },
  { name: "NorthPeak", cls: "font-display font-semibold italic" },
  { name: "VERMILION", cls: "font-sans font-bold tracking-widest" },
  { name: "BlueOrbit", cls: "font-display font-medium tracking-wide" },
  { name: "HEXALAB", cls: "font-sans font-semibold tracking-[0.32em]" },
  { name: "Stratos", cls: "font-display font-bold italic" },
  { name: "Kinetic+", cls: "font-display font-extrabold tracking-tight" },
  { name: "AURIGA", cls: "font-sans font-medium tracking-[0.28em]" },
];

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/stack", label: "Stack" },
  { to: "/contact-us", label: "Contact" },
];

export const SERVICES = [
  {
    id: "web",
    icon: Globe,
    title: "Web Development",
    blurb: "Web applications, platforms, and digital products that perform at scale - clean architecture, strong performance, and design users actually enjoy.",
    tags: ["Next.js", "React", "Node.js", "FastAPI", "Shopify", "Headless CMS"],
  },
  {
    id: "product",
    icon: Layers,
    title: "Product Development",
    blurb: "From concept to working product - strategy, user research, technical scoping, sprint planning, and iterative delivery. MVPs to mature platforms.",
    tags: ["Product Strategy", "MVP", "User Research", "Scoping"],
  },
  {
    id: "software",
    icon: Braces,
    title: "Software Development",
    blurb: "Custom software purpose-built for your business - CRM, ERP, internal tools, automation systems, and complex multi-service architectures.",
    tags: ["CRM", "ERP", "Automation", "Workflow Engines"],
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Development",
    blurb: "Native and cross-platform apps for iOS and Android, designed for the device first - never adapted from a web layout.",
    tags: ["React Native", "Expo", "Swift", "Kotlin", "Flutter"],
  },
  {
    id: "ai",
    icon: BrainCircuit,
    title: "AI & Machine Learning",
    blurb: "Custom AI and ML systems - not wrappers. Trained on your data, integrated into your workflows, designed to do real work in production.",
    tags: ["ML", "Deep Learning", "AI Agents", "RAG", "LLM Integration"],
  },
  {
    id: "data",
    icon: BarChart3,
    title: "Data & Analytics",
    blurb: "Pipelines, warehouses, real-time dashboards, and BI platforms that turn raw data into decisions - connected to the AI layer when you're ready.",
    tags: ["Data Engineering", "Warehouses", "BI", "Real-time Analytics"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud & Infrastructure",
    blurb: "Secure, observable, automated infrastructure on AWS, GCP, and Azure - architecture, migration, containers, and CI/CD from day one.",
    tags: ["AWS", "GCP", "Azure", "Kubernetes", "Terraform"],
  },
  {
    id: "design",
    icon: PenTool,
    title: "UI/UX Design",
    blurb: "Design is the layer that decides whether a product is used or abandoned. Wireframes to complete design systems, built to be implemented accurately.",
    tags: ["Design Systems", "Prototypes", "Figma", "Interaction Detail"],
  },
];

export const PROCESS = [
  { n: "01", title: "Understand before recommending", text: "We learn your business, users, constraints, and goals before proposing anything. The wrong solution delivered well is still the wrong solution." },
  { n: "02", title: "Scope before building", text: "Every engagement begins with a documented scope of work. You know exactly what you get, what it costs, and what success looks like." },
  { n: "03", title: "Show progress every week", text: "Two-week sprints with a working demo every Friday. Real progress every week - not a finished product at the end of six months." },
  { n: "04", title: "Be honest when it is not working", text: "If an approach is wrong, we say so - even mid-path. If timelines shift, you hear it early, never when it is too late to adjust." },
  { n: "05", title: "Own the outcome, not just the output", text: "We measure success by whether the product works for your users and moves your business. Shipping code is not the goal; the result is." },
];

export const PRODUCTS = [
  {
    id: "oryai",
    name: "OryAI",
    tagline: "Proprietary AI intelligence platform",
    model: "PaaS + Custom",
    ideal: "Enterprises adding production-grade AI to existing products",
    description: "The modular infrastructure layer underneath the AI features we build - agent framework, knowledge management, evaluation, and connectors - so AI deploys reliably in production, not just in a prototype.",
    image: "/orycms/img/OryAI.png",
    logo: "/orycms/oryai.png",
    siteUrl: "oryai.orynticlabs.com",
    theme: "dark",
    features: ["Custom AI agent builder & orchestration", "RAG with multiple vector databases", "LLM layer - OpenAI, Anthropic, open-source", "Workflow automation builder", "Conversation memory & sessions", "Evaluation & monitoring dashboard", "Multi-language - Hindi & English"],
  },
  {
    id: "orycms",
    name: "OryCMS",
    tagline: "Headless content management, minus the complexity",
    model: "PaaS / SaaS",
    ideal: "Product & marketing teams publishing across platforms",
    description: "A modern content architecture for product and marketing teams that publish across web, mobile, email, and third-party platforms - without depending on a developer for every change.",
    image: "/orycms/img/orybanner.png",
    logo: "/orycms/orycmslogo.png",
    siteUrl: "orycms.orynticlabs.com",
    theme: "light",
    features: ["API-first - REST & GraphQL", "Visual editor with structured content", "Role-based editorial workflows", "Multi-site & multi-language", "Media library with CDN delivery", "Webhooks & integrations", "White-label ready"],
  },
  {
    id: "performx",
    name: "PerformX",
    tagline: "HRMS for the full employee lifecycle",
    model: "SaaS",
    ideal: "Growing teams that need the full employee lifecycle in one place",
    description: "Built because existing HR tools were too expensive, too rigid, or missing what we needed. Onboarding to payroll, leave, performance, and offboarding - the version we wanted to use ourselves.",
    image: "/orycms/img/performx.png",
    logo: "/orycms/performxlogo.png",
    siteUrl: "performx.orynticlabs.com",
    theme: "dark",
    features: ["Employee records & documents", "Onboarding automation", "Attendance & leave with auto LOP", "Payroll & payslip generation", "Performance review cycles", "Internal mail & meetings", "Direct salary disbursement", "AWS-deployed, fully backed up"],
  },
];

export const INDUSTRIES = [
  {
    name: "Fintech",
    build: "We've shipped payment platforms and lending systems for fintechs, plus the fraud detection and KYC/AML checks that keep regulators satisfied.",
    approach: "Regulatory constraints shape the build from day one - KYC/AML and audit requirements aren't bolted on after the fact.",
    capabilities: ["Payment platforms", "Lending systems", "Portfolio management", "Fraud detection", "KYC/AML automation", "Financial analytics"],
  },
  {
    name: "Healthcare & Biotech",
    build: "Patient records, clinical data platforms, and diagnostic AI - built to handle sensitive data the way healthcare actually requires.",
    approach: "Every system is built around how patient data actually needs to move, be stored, and be audited - to the standard healthcare compliance demands.",
    capabilities: ["Patient management systems", "Clinical data platforms", "Diagnostic AI", "Telemedicine infrastructure", "Biomedical data pipelines"],
  },
  {
    name: "EdTech",
    build: "Learning platforms that adapt to how a student is actually doing, backed by the analytics and assessment engines that make that possible.",
    approach: "We start from how a student and a teacher actually use the platform day to day, not a generic LMS template.",
    capabilities: ["Learning management systems", "Adaptive learning platforms", "Student analytics", "Assessment engines", "Content delivery"],
  },
  {
    name: "Supply Chain & Logistics",
    build: "Shipment tracking and warehouse systems that tell you where something actually is, not where it was supposed to be.",
    approach: "Real-time visibility across warehouses and shipments, built around what an operations team needs to see - not a dashboard for its own sake.",
    capabilities: ["Shipment tracking", "Warehouse management", "Route optimisation", "Supplier portals", "Inventory intelligence"],
  },
  {
    name: "Manufacturing",
    build: "Production monitoring and predictive maintenance that catches a failing machine before it stops the line.",
    approach: "Sensor data, production metrics, and maintenance schedules feed into one system, not three disconnected tools on the factory floor.",
    capabilities: ["Production monitoring", "Quality control systems", "Predictive maintenance", "Factory floor digitisation"],
  },
  {
    name: "Agriculture",
    build: "Precision farming tools and crop intelligence that turn field data into decisions a farmer can act on that same season.",
    approach: "Field data has to work with patchy connectivity and seasonal decision windows - the platform is built around that reality, not against it.",
    capabilities: ["Crop intelligence", "Precision farming tools", "Supply chain visibility", "Market linkage platforms"],
  },
  {
    name: "Retail & E-commerce",
    build: "Storefronts, inventory systems, and loyalty platforms built to handle real order volume, not a demo cart.",
    approach: "Built to survive a real sale-day traffic spike, not just demo well in a pitch.",
    capabilities: ["Custom storefronts", "Inventory management", "Personalisation engines", "Omnichannel commerce", "Loyalty platforms"],
  },
  {
    name: "Energy & Utilities",
    build: "Grid monitoring and consumption analytics that catch problems in the network before customers notice them.",
    approach: "Grid and consumption data get monitored and reported the way regulators and operators actually need it, not just visualised for a demo.",
    capabilities: ["Grid monitoring", "Energy consumption analytics", "Predictive maintenance", "Sustainability reporting"],
  },
  {
    name: "Real Estate",
    build: "Listing platforms and valuation tools that make a property searchable, comparable, and easy to close on.",
    approach: "Listings, valuations, and agreements connected end to end, so a broker isn't re-entering the same data three times.",
    capabilities: ["Property listing platforms", "Valuation tools", "Tenant management", "Digital agreements", "Broker portals"],
  },
  {
    name: "Automobile",
    build: "Fleet management and vehicle telematics - down to the EV charging infrastructure most shops aren't set up to build.",
    approach: "Fleet and telematics data built for dealers and operators who need answers in real time, not a monthly report.",
    capabilities: ["Fleet management", "Vehicle telematics", "Dealer management systems", "EV infrastructure software"],
  },
  {
    name: "Hospitality & Food",
    build: "Reservation systems and kitchen management that keep a dining room running smoothly during a Friday night rush.",
    approach: "Reservations, kitchen operations, and POS wired together so a Friday night rush doesn't expose the gaps between three separate systems.",
    capabilities: ["Reservation systems", "POS integration", "Kitchen management", "Guest experience platforms", "Delivery operations"],
  },
];

export const TECH_GROUPS = [
  { name: "Frontend", tools: ["Next.js", "React", "TypeScript", "Vue.js", "Tailwind CSS", "Framer Motion", "GSAP", "Redux", "Zustand", "React Query"] },
  { name: "Backend", tools: ["Node.js", "Express", "FastAPI", "Django", "Go", "Spring Boot", "GraphQL", "REST", "WebSockets"] },
  { name: "Mobile", tools: ["React Native", "Expo", "Swift", "Kotlin", "Flutter"] },
  { name: "AI & ML", tools: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "Hugging Face", "LangChain", "LangGraph", "OpenAI API", "Claude API", "Llama / Mistral / Qwen", "RAG", "OpenCV", "YOLO", "MLflow", "Celery"] },
  { name: "Data & Analytics", tools: ["Apache Spark", "Kafka", "dbt", "BigQuery", "Redshift", "Looker Studio", "Metabase", "Pandas", "Airflow"] },
  { name: "Databases", tools: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Supabase", "Firebase", "Pinecone", "Weaviate"] },
  { name: "Cloud & Infrastructure", tools: ["AWS", "Google Cloud", "Azure", "Vercel", "Cloudflare"] },
  { name: "DevOps & CI/CD", tools: ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "Nginx", "Datadog", "Sentry", "Prometheus", "Grafana"] },
  { name: "CMS & Commerce", tools: ["Shopify", "WordPress", "Payload CMS", "Strapi", "Sanity", "Contentful"] },
  { name: "APIs & Integration", tools: ["REST", "GraphQL", "gRPC", "Webhooks", "Razorpay", "Stripe", "Twilio", "SendGrid", "Google Maps", "DigiLocker"] },
  { name: "Security", tools: ["JWT", "OAuth 2.0", "OpenID Connect", "bcrypt", "Argon2", "AWS IAM", "TLS 1.3", "OWASP"] },
  { name: "Testing & QA", tools: ["Jest", "Vitest", "Testing Library", "Playwright", "Cypress", "Pytest", "Postman"] },
  { name: "Design & Collaboration", tools: ["Figma", "Adobe Creative Suite", "Whimsical", "Notion", "Linear", "Slack", "Loom"] },
];

export const WHY_US = [
  { title: "We cover the full stack", text: "Web, mobile, AI, data, design, infrastructure, and consulting - one accountable team under one roof." },
  { title: "We build for the long term", text: "Code the next engineer can extend, systems that scale, documentation included. No shortcuts that cost you later." },
  { title: "We have real AI capability", text: "Not prompt engineering. Trained models, intelligent agents, data pipelines, production-grade ML infrastructure." },
  { title: "We treat your business like our own", text: "The people on your kickoff call build your product. Founders stay directly involved - no handoffs to junior teams." },
  { title: "We run our own products", text: "OryAI, OryCMS, and PerformX are systems we use daily. We understand operational reality, not just specifications." },
];

export const MARQUEE_ITEMS = [
  "AI Systems", "Web Platforms", "Mobile Apps", "Data Pipelines", "Cloud Infrastructure",
  "Product Design", "LLM Integration", "Enterprise Software", "Headless Commerce",
];

export const CONTACT = {
  sales: "sales@orynticlabs.com",
  support: "support@orynticlabs.com",
  phone: "+91 76489 15266",
  website: "www.orynticlabs.com",
};

export const HERO_VIDEO = "https://videos.pexels.com/video-files/3141210/3141210-uhd_2560_1440_25fps.mp4";

export const TECH_RIBBON = [
  "AWS", "Google Cloud", "Azure", "Kubernetes", "TensorFlow", "PyTorch", "LangChain",
  "OpenAI", "Anthropic", "Next.js", "React", "PostgreSQL", "Kafka", "Terraform", "Shopify",
];

export const SERVICE_GROUPS = [
  {
    icon: "Compass",
    title: "Technology & Product Strategy",
    text: "Before anything gets built, we sit with your roadmap and your constraints and tell you honestly where the risk actually is - even when that means a smaller first release than you asked for.",
    link: "View Consulting Services",
    href: "/consulting",
  },
  {
    icon: "Layers",
    title: "Product & Software Engineering",
    text: "From a founder's first sketch to a platform carrying real production traffic - built with architecture the next engineer can extend and tests that catch problems before your users do.",
    link: "View Engineering Services",
    href: "/services",
  },
  {
    icon: "BrainCircuit",
    title: "Applied AI & Data Systems",
    text: "We train models on your data and wire agents into your actual workflows - the RAG pipelines, evaluation dashboards, and analytics behind them, not a chatbot bolted onto a landing page.",
    link: "View AI Services",
    href: "/services",
  },
  {
    icon: "Cloud",
    title: "Cloud & Infrastructure Operations",
    text: "We design infrastructure on AWS, GCP, or Azure that pages someone before it breaks, not after - containers, CI/CD, and security configured once, correctly, instead of patched forever.",
    link: "View Cloud Services",
    href: "/services",
  },
];

export const HOME_STATS = [
  { value: "08", label: "Service Practices", caption: "covering the complete software lifecycle under one roof", image: "datacenter" },
  { value: "03", label: "Proprietary Products", caption: "OryAI, OryCMS, and PerformX - running in production daily", image: "dashboard" },
  { value: "11", label: "Industries Served", caption: "with deep domain exposure from fintech to agriculture", image: "architecture" },
  { value: "100%", label: "Founder-Led Delivery", caption: "the people on your kickoff call build your product", image: "hero" },
];

export const ORYAI_ECOSYSTEM = [
  {
    icon: "Bot",
    title: "AI Agents & GenAI Integration",
    points: ["Custom agent builder & orchestration", "LLM layer - OpenAI, Anthropic, open-source", "Workflow automation builder"],
  },
  {
    icon: "Database",
    title: "RAG & Knowledge Systems",
    points: ["Multi-vector-database retrieval", "Domain knowledge grounded answers", "Multi-language - Hindi & English"],
  },
  {
    icon: "Gauge",
    title: "Evaluation & Monitoring",
    points: ["Production evaluation dashboard", "Conversation memory & sessions", "Reliability beyond the prototype"],
  },
];

export const FAQS = [
  {
    q: "What services does Oryntic Labs offer?",
    a: "Eight practices across the complete software lifecycle - web development, product development, custom software, mobile apps, AI & machine learning, data & analytics, cloud infrastructure, and UI/UX design - plus staff augmentation and technology consulting for teams that need talent or advisory support.",
  },
  {
    q: "What engagement models do you support?",
    a: "Three delivery models: SaaS (subscribe to platforms we build and run), PaaS (build on our proprietary platforms like OryAI and OryCMS), and custom project-based engagements scoped around your exact requirements. You work with us in whatever way fits your business best.",
  },
  {
    q: "Is your AI capability real or just API wrappers?",
    a: "Real. We build custom AI and ML systems - predictive models, neural networks, intelligent agents, RAG architectures, and production-grade ML infrastructure trained on your data and integrated into your workflows. And we are honest when a simpler approach will do the job better.",
  },
  {
    q: "How does a typical engagement work?",
    a: "We understand before recommending, document the scope before building, work in two-week sprints with a working demo every Friday, communicate honestly when something is not working, and measure success by outcomes - not just shipped code.",
  },
  {
    q: "Which industries do you serve?",
    a: "Eleven and counting: fintech, healthcare & biotech, EdTech, supply chain & logistics, manufacturing, agriculture, retail & e-commerce, energy & utilities, real estate, automobile, and hospitality & food service. In each, we understand the domain deeply before proposing a solution.",
  },
];

export const INDUSTRY_IMAGES = ["architecture", "datacenter", "ai", "dashboard", "hero", "about", "culture"];

export const CONTACT_FAQS = [
  {
    q: "How quickly will I actually hear back?",
    a: "Within one business day, from someone who read your message - not an autoresponder. If your query is urgent, call or WhatsApp us and we'll prioritize it the same day.",
  },
  {
    q: "Do you sign an NDA before we discuss the idea in detail?",
    a: "Yes. Tick the NDA box on the form and we'll send one over before the first call, so you can talk freely about what you're building before any commitment is made.",
  },
  {
    q: "What should I include in my message to get a useful reply?",
    a: "A short description of the problem, roughly where you are (idea, existing product, or a system that needs fixing), and a rough timeline or budget range if you have one. The more context you give, the more specific our first response will be - no generic sales deck in return.",
  },
  {
    q: "Do you work with clients outside India?",
    a: "Yes. Our engineering team is based in Gurugram and Rewa, but we run projects for clients across time zones - the same team stays on your calls throughout, not a rotating support desk.",
  },
  {
    q: "I just need extra developers, not a full project. Can you help?",
    a: 'Yes - pick "Staff Augmentation" from the dropdown. We place vetted engineers directly into your team, working your hours and your tools, for as long as you need the extra capacity.',
  },
  {
    q: "Is the initial consultation free?",
    a: "Yes. The first call is a scoping conversation, not a sales pitch - we ask questions, tell you honestly if we're a fit, and outline what a working engagement would look like before anything is signed.",
  },
];
