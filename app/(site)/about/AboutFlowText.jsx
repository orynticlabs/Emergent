"use client";

/**
 * Aceternity "Wispr Flow" text-along-a-path effect, used here as a purely
 * decorative background element (the original's drag-to-edit path tooling
 * is a design-time aid, not something a visitor needs, so it's dropped).
 * A long, unbroken paragraph about OrynticLabs drifts along a curved path.
 */

const VIEW_W = 1048;
const VIEW_H = 594;

const round = (n) => Math.round(n * 1000) / 1000;
const rp = (p) => ({ x: round(p.x), y: round(p.y) });
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const ORIGINAL_SEGMENTS = [
  { p0: { x: 0.597656, y: 50.924805 }, p1: { x: 17.4612, y: 143.2965 }, p2: { x: 97.8522, y: 293.141 }, p3: { x: 284.508, y: 353.548 } },
  { p0: { x: 284.508, y: 353.548 }, p1: { x: 440.828, y: 399.056 }, p2: { x: 583.839, y: 294.067 }, p3: { x: 500.618, y: 184.7492 } },
  { p0: { x: 500.618, y: 184.7492 }, p1: { x: 417.397, y: 75.4309 }, p2: { x: 238.217, y: 282.098 }, p3: { x: 499.258, y: 441.668 } },
  { p0: { x: 499.258, y: 441.668 }, p1: { x: 551.913, y: 477.802 }, p2: { x: 817.468, y: 561.26 }, p3: { x: 1046.43, y: 565.235 } },
];

function splitCubic(b, t) {
  const a1 = lerp(b.p0, b.p1, t);
  const a2 = lerp(b.p1, b.p2, t);
  const a3 = lerp(b.p2, b.p3, t);
  const b1 = lerp(a1, a2, t);
  const b2 = lerp(a2, a3, t);
  const mid = lerp(b1, b2, t);
  return { left: { p0: b.p0, p1: a1, p2: b1, p3: mid }, right: { p0: mid, p1: b2, p2: a3, p3: b.p3 } };
}

function subCubic(b, t0, t1) {
  const right = splitCubic(b, t0).right;
  const t = (t1 - t0) / (1 - t0);
  return splitCubic(right, t).left;
}

function buildPathD() {
  let d = `M${round(ORIGINAL_SEGMENTS[0].p0.x)} ${round(ORIGINAL_SEGMENTS[0].p0.y)}`;
  for (const cubic of ORIGINAL_SEGMENTS) {
    for (let i = 0; i < 2; i++) {
      const sub = subCubic(cubic, i / 2, (i + 1) / 2);
      const c1 = rp(sub.p1);
      const c2 = rp(sub.p2);
      const end = rp(sub.p3);
      d += `C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
    }
  }
  return d;
}

const PATH_D = buildPathD();

const FLOW_TEXT =
  "We started OrynticLabs because most software studios either move fast and break things or move carefully and never ship anything real, and we wanted neither — we wanted a team that scopes honestly before writing a line of code, ships in two-week sprints with a working demo every Friday, tells you the truth when a timeline is slipping instead of hiding it until it's too late, and stays involved from the first kickoff call through production and long after launch, because software nobody uses isn't finished, it's just deployed, and that difference is the whole point of the work.";

export default function AboutFlowText({ speed = 25, fontSize = 15, textOpacity = 0.5, textColor = "#ffffff", strokeColor = "rgba(255,255,255,0.08)" }) {
  return (
    <div className="relative w-full overflow-hidden bg-brand-ink py-4" data-testid="about-flow-text">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
        aria-hidden="true"
      >
        <path id="about-flow-curve" fill="transparent" stroke={strokeColor} d={PATH_D} />
        <text x="0" style={{ fontSize }}>
          <textPath href="#about-flow-curve" className="font-normal [baseline-shift:-20%]" style={{ fill: textColor, opacity: textOpacity }}>
            {FLOW_TEXT}
          </textPath>
          <animate attributeName="x" dur={`${65 - speed}s`} values="-2000;0" repeatCount="indefinite" />
        </text>
      </svg>
    </div>
  );
}
