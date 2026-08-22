import { Check } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const MODELS = [
  {
    n: "01",
    title: "Architecture Review",
    desc: "A senior architect maps your systems, identifies AI opportunities, and delivers a concrete roadmap — before any contract.",
    points: [
      "AI readiness audit by a principal engineer",
      "Prioritized opportunities with business impact",
      "Clear phased roadmap — no fluff",
    ],
    best: "Enterprises who want an expert view before committing to a major AI initiative.",
    recommended: false,
  },
  {
    n: "02",
    title: "Dedicated Engineering Pod",
    desc: "A dedicated team of senior engineers embedded in your product cycle, moving at your speed.",
    points: [
      "AI, data & automation specialists",
      "Two-week sprints with working demos every Friday",
      "Complete IP & source code ownership",
    ],
    best: "Leaders building complex AI systems or new digital products with fast delivery expectations.",
    recommended: false,
  },
  {
    n: "03",
    title: "Full Digital Transformation",
    desc: "A long-term technology partnership — full AI adoption, legacy modernization, and building capability your team can sustain.",
    points: [
      "Multi-phase AI & platform transformation",
      "Cross-functional: AI, data, cloud, mobile",
      "Founder involvement & quarterly reviews",
    ],
    best: "Organizations ready to make technology a lasting competitive advantage.",
    recommended: true,
  },
];

export default function EngagementModels() {
  return (
    <section data-testid="engagement-models" className="bg-mesh-brand relative overflow-hidden border-t border-white/10 py-24 text-white md:py-32">
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
            Three Ways to Start Your <span className="text-brand-orange">Digital Transformation.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/60 md:text-lg">
            Every engagement starts with an honest conversation with a senior architect — no sales pitch, just a clear plan.
          </p>
        </Reveal>

        <div className="mt-14">
          {MODELS.map((m, i) => (
            <Reveal key={m.n} delay={0.05 * i}>
              <div
                data-testid={`engagement-model-${i}`}
                className="border-b border-white/10 py-10 first:pt-2 last:border-b-0"
              >
                <h3 className="flex flex-wrap items-center gap-x-4 gap-y-3 font-display text-2xl md:text-3xl font-bold tracking-tight">
                  <span className="text-brand-blue">{m.n}</span>
                  {m.title}
                  {m.recommended && (
                    <span className="rounded-full bg-brand-orange px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      Most Recommended
                    </span>
                  )}
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60 md:text-base">{m.desc}</p>

                <div className="mt-7 grid gap-5 sm:grid-cols-3">
                  {m.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 border-b border-white/15 pb-3.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                      </span>
                      <span className="text-sm font-medium text-white/85">{point}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs leading-relaxed text-white/45 md:text-sm">
                  <span className="font-semibold text-white/65">Best for:</span> {m.best}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
