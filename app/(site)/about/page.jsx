import { IMAGES } from "@site/data/content";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";
import { buildPageMetadata } from "@site/lib/seo";
import ClientMarquee from "@site/components/site/ClientMarquee";
import AboutHero from "./AboutHero";
import AboutFeatures from "./AboutFeatures";
import AboutWhyUs from "./AboutWhyUs";
import AboutTestimonials from "./AboutTestimonials";
import AboutFlowText from "./AboutFlowText";
import AboutGallery from "./AboutGallery";

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

      <ClientMarquee />

      <AboutFlowText />

      <section className="bg-brand-ink pb-24 pt-10 text-white md:pb-32 md:pt-14" data-testid="about-who-we-are">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionHead
              titleClassName="text-2xl md:text-7xl uppercase"
              wrapperClassName="max-w-lg"
              title={
                <>
                  Who
                  <br />
                  <CanvasText
                    text="Are We"
                    className="font-display text-2xl font-black uppercase md:text-7xl"
                    colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
                    lineGap={6}
                    animationDuration={10}
                  />
                </>
              }
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

      <AboutWhyUs />

      <AboutGallery />

      <AboutTestimonials />
    </main>
  );
}
