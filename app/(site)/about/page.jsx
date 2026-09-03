import { IMAGES, CLIENTS } from "@site/data/content";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import { buildPageMetadata } from "@site/lib/seo";
import AboutHero from "./AboutHero";
import AboutFeatures from "./AboutFeatures";
import AboutWhyUs from "./AboutWhyUs";
import AboutTestimonials from "./AboutTestimonials";
import AboutFlowText from "./AboutFlowText";
import AboutGallery from "./AboutGallery";
import AboutCTA from "./AboutCTA";

export const metadata = buildPageMetadata({
  title: "About Us",
  description:
    "OrynticLabs is not a generalist IT vendor. We are a focused engineering and product studio that combines deep technical expertise with design intelligence and business understanding.",
  path: "/about",
  image: IMAGES.about,
});

const WHO_WE_ARE_STATS = [
  { value: "100+", label: "Technologies in our stack" },
  { value: "11", label: "Industries served" },
  { value: "03", label: "Proprietary products" },
  { value: "08", label: "Service practices" },
];

export default function About() {
  return (
    <main data-testid="about-page">
      <AboutHero />

      <AboutFlowText />

      <section className="bg-brand-ink pb-24 pt-10 text-white md:pb-32 md:pt-14" data-testid="about-who-we-are">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionHead
              titleClassName="text-2xl md:text-7xl uppercase"
              wrapperClassName="max-w-lg"
              title="Who Are We"
              description="OrynticLabs is a full-spectrum engineering and product studio — we design, build, and deliver custom technology across web, mobile, AI, data, and cloud, helping businesses innovate, scale, and lead in their industry."
            />
            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
              {WHO_WE_ARE_STATS.map((s, i) => (
                <Reveal key={s.label} delay={0.08 * i}>
                  <p className="font-display text-4xl font-black tracking-tight text-white md:text-6xl">{s.value}</p>
                  <p className="mt-2 text-sm text-white/50 md:text-base">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutFeatures />

      <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-trusted">
        <div className="mx-auto max-w-5xl px-6 text-center md:px-10">
          <SectionHead
            align="center"
            titleClassName="text-2xl md:text-7xl uppercase"
            wrapperClassName="max-w-4xl"
            title="Trusted by the best companies"
            description="Companies that have been using our product from the very start."
          />
          <Reveal delay={0.15}>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
              {CLIENTS.map((c) => (
                <span
                  key={c.name}
                  data-testid={`about-trusted-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className={`text-2xl text-white/70 transition-colors duration-300 hover:text-white ${c.cls}`}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <AboutWhyUs />

      <AboutGallery />

      <AboutTestimonials />

      <AboutCTA />
    </main>
  );
}
