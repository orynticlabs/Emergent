import { Link } from "react-router-dom";
import { ArrowRight, Car, Radio, Store, Zap, Check } from "lucide-react";
import { IMAGES } from "@/data/content";
import { Reveal, Overline } from "@/components/site/Reveal";

const CAPABILITIES = [
  {
    icon: Car,
    title: "Fleet Management Systems",
    text: "Live fleet dashboards that track every vehicle, driver, and route in real time — trip histories, fuel usage, driver behaviour scoring, geofencing alerts, and maintenance schedules in one operational view. Built for logistics operators, rental fleets, and enterprise transport teams that cannot afford blind spots.",
  },
  {
    icon: Radio,
    title: "Vehicle Telematics Platforms",
    text: "End-to-end telematics pipelines — from on-device data ingestion to cloud processing and analytics. GPS streams, CAN-bus diagnostics, and sensor data are turned into live dashboards, predictive maintenance signals, and compliance reports your operations team actually uses.",
  },
  {
    icon: Store,
    title: "Dealer & Distributor Systems",
    text: "Digital infrastructure for dealer networks: inventory and stock visibility across locations, test-drive and booking management, service scheduling, warranty tracking, and sales analytics — replacing spreadsheets and phone calls with a single source of truth.",
  },
  {
    icon: Zap,
    title: "EV & Charging Infrastructure Software",
    text: "Software for the electric transition — charging station management, session and billing engines, energy consumption analytics, and driver-facing mobile apps. Designed to scale from a single depot to a city-wide charging network.",
  },
];

const DELIVERABLES = [
  "Real-time fleet & telematics dashboards",
  "Dealer management & inventory platforms",
  "EV charging management & billing engines",
  "Driver and customer mobile applications",
  "Predictive maintenance powered by AI",
  "Integration with OEM & IoT data streams",
];

export default function AutomobileSection() {
  return (
    <section data-testid="automobile-section" className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32">
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand-orange/10 blur-[140px]" aria-hidden="true" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-blue/15 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <Overline>Industry Spotlight — Automobile</Overline>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                Software for the Future of <span className="text-brand-orange">Mobility.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-2xl leading-relaxed text-white/60">
                The automobile industry is no longer just about vehicles — it is about the software
                that runs them, connects them, and sells them. We build the digital layer for mobility
                businesses: systems that track fleets in real time, read vehicle data as it streams,
                digitise dealer networks, and power EV charging infrastructure.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/60">
                Whether you operate ten vehicles or ten thousand, the pattern is the same — we understand
                your operations first, then engineer platforms that turn vehicle data, dealer workflows,
                and charging networks into decisions and revenue.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <Reveal key={cap.title} delay={0.06 * i}>
                    <div
                      data-testid={`automobile-capability-${i}`}
                      className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/50 hover:bg-white/[0.05]"
                    >
                      <Icon className="h-8 w-8 text-brand-blue transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.5} />
                      <h3 className="mt-5 font-display text-lg font-bold tracking-tight">{cap.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/50">{cap.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal delay={0.15}>
                <div className="overflow-hidden rounded-3xl border border-white/10 glow-orange">
                  <img src={IMAGES.architecture} alt="Automotive engineering and mobility infrastructure" className="h-72 w-full object-cover md:h-80" />
                </div>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm" data-testid="automobile-deliverables">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">What we deliver</p>
                  <ul className="mt-5 space-y-3.5">
                    {DELIVERABLES.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2.5} />
                        <span className="text-sm leading-relaxed text-white/70">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/industries"
                    data-testid="automobile-explore-link"
                    className="group mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange"
                  >
                    Explore all 11 industries
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
