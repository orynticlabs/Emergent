import {
  Globe, Layers, Braces, Smartphone, BrainCircuit, BarChart3, Cloud, PenTool,
} from "lucide-react";

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1534312527009-56c7016453e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxmdXR1cmlzdGljJTIwYWJzdHJhY3QlMjBibHVlJTIwb3JhbmdlJTIwZ2xvd2luZ3xlbnwwfHx8fDE3ODczNzY5NTN8MA&ixlib=rb-4.1.0&q=85",
  about: "https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  culture: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGVuZ2luZWVyaW5nJTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzg3Mzc2OTUzfDA&ixlib=rb-4.1.0&q=85",
  ai: "https://images.unsplash.com/photo-1770233621425-5d9ee7a0a700?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYWJzdHJhY3QlMjBkaWdpdGFsfGVufDB8fHx8MTc4NzM3Njk1M3ww&ixlib=rb-4.1.0&q=85",
  dashboard: "https://images.pexels.com/photos/27141316/pexels-photo-27141316.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  architecture: "https://images.pexels.com/photos/33719029/pexels-photo-33719029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  datacenter: "https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/stack", label: "Stack" },
  { to: "/contact", label: "Contact" },
];

export const SERVICES = [
  {
    id: "web",
    icon: Globe,
    title: "Web Development",
    blurb: "Web applications, platforms, and digital products that perform at scale — clean architecture, strong performance, and design users actually enjoy.",
    tags: ["Next.js", "React", "Node.js", "FastAPI", "Shopify", "Headless CMS"],
  },
  {
    id: "product",
    icon: Layers,
    title: "Product Development",
    blurb: "From concept to working product — strategy, user research, technical scoping, sprint planning, and iterative delivery. MVPs to mature platforms.",
    tags: ["Product Strategy", "MVP", "User Research", "Scoping"],
  },
  {
    id: "software",
    icon: Braces,
    title: "Software Development",
    blurb: "Custom software purpose-built for your business — CRM, ERP, internal tools, automation systems, and complex multi-service architectures.",
    tags: ["CRM", "ERP", "Automation", "Workflow Engines"],
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Development",
    blurb: "Native and cross-platform apps for iOS and Android, designed for the device first — never adapted from a web layout.",
    tags: ["React Native", "Expo", "Swift", "Kotlin", "Flutter"],
  },
  {
    id: "ai",
    icon: BrainCircuit,
    title: "AI & Machine Learning",
    blurb: "Custom AI and ML systems — not wrappers. Trained on your data, integrated into your workflows, designed to do real work in production.",
    tags: ["ML", "Deep Learning", "AI Agents", "RAG", "LLM Integration"],
  },
  {
    id: "data",
    icon: BarChart3,
    title: "Data & Analytics",
    blurb: "Pipelines, warehouses, real-time dashboards, and BI platforms that turn raw data into decisions — connected to the AI layer when you're ready.",
    tags: ["Data Engineering", "Warehouses", "BI", "Real-time Analytics"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud & Infrastructure",
    blurb: "Secure, observable, automated infrastructure on AWS, GCP, and Azure — architecture, migration, containers, and CI/CD from day one.",
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
  { n: "03", title: "Show progress every week", text: "Two-week sprints with a working demo every Friday. Real progress every week — not a finished product at the end of six months." },
  { n: "04", title: "Be honest when it is not working", text: "If an approach is wrong, we say so — even mid-path. If timelines shift, you hear it early, never when it is too late to adjust." },
  { n: "05", title: "Own the outcome, not just the output", text: "We measure success by whether the product works for your users and moves your business. Shipping code is not the goal; the result is." },
];

export const PRODUCTS = [
  {
    id: "oryai",
    name: "OryAI",
    tagline: "Proprietary AI intelligence platform",
    description: "The modular infrastructure layer underneath the AI features we build — agent framework, knowledge management, evaluation, and connectors — so AI deploys reliably in production, not just in a prototype.",
    image: IMAGES.ai,
    theme: "dark",
    features: ["Custom AI agent builder & orchestration", "RAG with multiple vector databases", "LLM layer — OpenAI, Anthropic, open-source", "Workflow automation builder", "Conversation memory & sessions", "Evaluation & monitoring dashboard", "Multi-language — Hindi & English"],
  },
  {
    id: "orycms",
    name: "OryCMS",
    tagline: "Headless content management, minus the complexity",
    description: "A modern content architecture for product and marketing teams that publish across web, mobile, email, and third-party platforms — without depending on a developer for every change.",
    image: IMAGES.dashboard,
    theme: "light",
    features: ["API-first — REST & GraphQL", "Visual editor with structured content", "Role-based editorial workflows", "Multi-site & multi-language", "Media library with CDN delivery", "Webhooks & integrations", "White-label ready"],
  },
  {
    id: "performx",
    name: "PerformX",
    tagline: "HRMS for the full employee lifecycle",
    description: "Built because existing HR tools were too expensive, too rigid, or missing what we needed. Onboarding to payroll, leave, performance, and offboarding — the version we wanted to use ourselves.",
    image: IMAGES.dashboard,
    theme: "dark",
    features: ["Employee records & documents", "Onboarding automation", "Attendance & leave with auto LOP", "Payroll & payslip generation", "Performance review cycles", "Internal mail & meetings", "Direct salary disbursement", "AWS-deployed, fully backed up"],
  },
];

export const INDUSTRIES = [
  { name: "Fintech", build: "Payment platforms, lending systems, fraud detection, KYC/AML automation, financial analytics." },
  { name: "Healthcare & Biotech", build: "Patient management, clinical data platforms, diagnostic AI, telemedicine infrastructure." },
  { name: "EdTech", build: "Learning management, adaptive learning, student analytics, assessment engines." },
  { name: "Supply Chain & Logistics", build: "Shipment tracking, warehouse management, route optimisation, inventory intelligence." },
  { name: "Manufacturing", build: "Production monitoring, quality control, predictive maintenance, floor digitisation." },
  { name: "Agriculture", build: "Crop intelligence, precision farming, supply chain visibility, market linkage." },
  { name: "Retail & E-commerce", build: "Custom storefronts, personalisation engines, omnichannel commerce, loyalty platforms." },
  { name: "Energy & Utilities", build: "Grid monitoring, consumption analytics, predictive maintenance, sustainability reporting." },
  { name: "Real Estate", build: "Listing platforms, valuation tools, tenant management, digital agreements." },
  { name: "Automobile", build: "Fleet management, vehicle telematics, dealer systems, EV infrastructure software." },
  { name: "Hospitality & Food", build: "Reservations, POS integration, kitchen management, guest experience, delivery ops." },
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
  { title: "We cover the full stack", text: "Web, mobile, AI, data, design, infrastructure, and consulting — one accountable team under one roof." },
  { title: "We build for the long term", text: "Code the next engineer can extend, systems that scale, documentation included. No shortcuts that cost you later." },
  { title: "We have real AI capability", text: "Not prompt engineering. Trained models, intelligent agents, data pipelines, production-grade ML infrastructure." },
  { title: "We treat your business like our own", text: "The people on your kickoff call build your product. Founders stay directly involved — no handoffs to junior teams." },
  { title: "We run our own products", text: "OryAI, OryCMS, and PerformX are systems we use daily. We understand operational reality, not just specifications." },
];

export const MARQUEE_ITEMS = [
  "AI Systems", "Web Platforms", "Mobile Apps", "Data Pipelines", "Cloud Infrastructure",
  "Product Design", "LLM Integration", "Enterprise Software", "Headless Commerce",
];

export const CONTACT = {
  sales: "sales@orynticlabs.com",
  support: "support@orynticlabs.com",
  general: "hello@orynticlabs.com",
  phone: "+91 79017 17617",
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
    title: "Strategic Technology Consulting",
    text: "From architecture audits to technology roadmaps, we help leaders align engineering decisions with business outcomes.",
    link: "View Consulting Services",
  },
  {
    icon: "Layers",
    title: "Product Development & Engineering",
    text: "Full-lifecycle engineering — from MVPs that validate quickly to enterprise platforms built to scale and last.",
    link: "View Engineering Services",
  },
  {
    icon: "BrainCircuit",
    title: "AI, Data & Analytics Solutions",
    text: "Custom AI agents, ML systems, and data platforms that automate operations and turn raw data into decisions.",
    link: "View AI Services",
  },
  {
    icon: "Cloud",
    title: "Cloud & Infrastructure Operations",
    text: "Secure, observable, automated cloud environments on AWS, GCP, and Azure — engineered to never fail at the worst moment.",
    link: "View Cloud Services",
  },
];

export const HOME_STATS = [
  { value: "08", label: "Service Practices", caption: "covering the complete software lifecycle under one roof", image: "datacenter" },
  { value: "03", label: "Proprietary Products", caption: "OryAI, OryCMS, and PerformX — running in production daily", image: "dashboard" },
  { value: "11", label: "Industries Served", caption: "with deep domain exposure from fintech to agriculture", image: "architecture" },
  { value: "100%", label: "Founder-Led Delivery", caption: "the people on your kickoff call build your product", image: "hero" },
];

export const ORYAI_ECOSYSTEM = [
  {
    icon: "Bot",
    title: "AI Agents & GenAI Integration",
    points: ["Custom agent builder & orchestration", "LLM layer — OpenAI, Anthropic, open-source", "Workflow automation builder"],
  },
  {
    icon: "Database",
    title: "RAG & Knowledge Systems",
    points: ["Multi-vector-database retrieval", "Domain knowledge grounded answers", "Multi-language — Hindi & English"],
  },
  {
    icon: "Gauge",
    title: "Evaluation & Monitoring",
    points: ["Production evaluation dashboard", "Conversation memory & sessions", "Reliability beyond the prototype"],
  },
];

export const FAQS = [
  {
    q: "What services does OrynticLabs offer?",
    a: "Eight practices across the complete software lifecycle — web development, product development, custom software, mobile apps, AI & machine learning, data & analytics, cloud infrastructure, and UI/UX design — plus staff augmentation and technology consulting for teams that need talent or advisory support.",
  },
  {
    q: "What engagement models do you support?",
    a: "Three delivery models: SaaS (subscribe to platforms we build and run), PaaS (build on our proprietary platforms like OryAI and OryCMS), and custom project-based engagements scoped around your exact requirements. You work with us in whatever way fits your business best.",
  },
  {
    q: "Is your AI capability real or just API wrappers?",
    a: "Real. We build custom AI and ML systems — predictive models, neural networks, intelligent agents, RAG architectures, and production-grade ML infrastructure trained on your data and integrated into your workflows. And we are honest when a simpler approach will do the job better.",
  },
  {
    q: "How does a typical engagement work?",
    a: "We understand before recommending, document the scope before building, work in two-week sprints with a working demo every Friday, communicate honestly when something is not working, and measure success by outcomes — not just shipped code.",
  },
  {
    q: "Which industries do you serve?",
    a: "Eleven and counting: fintech, healthcare & biotech, EdTech, supply chain & logistics, manufacturing, agriculture, retail & e-commerce, energy & utilities, real estate, automobile, and hospitality & food service. In each, we understand the domain deeply before proposing a solution.",
  },
];

export const INDUSTRY_IMAGES = ["architecture", "datacenter", "ai", "dashboard", "hero", "about", "culture"];
