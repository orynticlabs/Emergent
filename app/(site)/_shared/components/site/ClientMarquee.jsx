"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

export default function ClientMarquee() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    let cancelled = false;
    // Relative path - this API route is served by this same Next.js app.
    fetch(`/api/orycms/companies/public`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Companies fetch failed: ${res.status}`);
        return res.json();
      })
      .then((body) => {
        if (cancelled || !body?.success || !Array.isArray(body.data)) return;
        setClients(body.data.filter((c) => c.logoUrl));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (clients.length === 0) return null;

  return (
    <section data-testid="client-logos" className="border-y border-white/10 bg-[#05060e] py-14">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-white/30">
        Trusted by forward-thinking teams
      </p>
      <div className="mt-10">
        <Marquee speed={35} gradient gradientColor="#070707" gradientWidth={140} pauseOnHover>
          {clients.map((c) => (
            <span
              key={c.id}
              data-testid={`client-logo-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="group mx-14 inline-flex h-10 w-32 shrink-0 items-center justify-center"
            >
              <img
                src={c.logoUrl}
                alt={c.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain opacity-60 brightness-0 invert transition-all duration-500 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
              />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
