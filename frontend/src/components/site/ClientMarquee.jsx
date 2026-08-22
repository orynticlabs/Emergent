import Marquee from "react-fast-marquee";

const CLIENTS = [
  { name: "QUANTIVA", cls: "font-display font-bold tracking-[0.22em]" },
  { name: "NorthPeak", cls: "font-display font-semibold italic" },
  { name: "VERMILION", cls: "font-sans font-bold tracking-widest" },
  { name: "BlueOrbit", cls: "font-display font-medium tracking-wide" },
  { name: "HEXALAB", cls: "font-sans font-semibold tracking-[0.32em]" },
  { name: "Stratos", cls: "font-display font-bold italic" },
  { name: "Kinetic+", cls: "font-display font-extrabold tracking-tight" },
  { name: "AURIGA", cls: "font-sans font-medium tracking-[0.28em]" },
];

export default function ClientMarquee() {
  return (
    <section data-testid="client-logos" className="border-y border-white/10 bg-[#05060e] py-14">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-white/30">
        Trusted by forward-thinking teams
      </p>
      <div className="mt-10">
        <Marquee speed={35} gradient gradientColor="#070707" gradientWidth={140} pauseOnHover>
          {CLIENTS.map((c) => (
            <span
              key={c.name}
              data-testid={`client-logo-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`mx-14 inline-block cursor-default select-none text-2xl text-white/40 blur-[1.5px] transition-all duration-500 hover:text-white hover:blur-0 ${c.cls}`}
            >
              {c.name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
