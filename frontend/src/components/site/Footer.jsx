import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { NAV_LINKS, SERVICES, CONTACT } from "@/data/content";
import { Reveal, Overline } from "@/components/site/Reveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email });
      toast.success("You're on the list. Check your inbox for a welcome email.");
      setEmail("");
    } catch (err) {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer data-testid="site-footer" className="relative overflow-hidden border-t border-white/10 bg-brand-ink text-white">
      <div className="absolute -bottom-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <Overline>Stay in the loop</Overline>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
                LET'S BUILD<br />THE <span className="text-brand-orange">FUTURE.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-md text-white/60">
                Occasional, sharp thinking on AI systems, product engineering, and the platforms we are building. No noise.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <form onSubmit={subscribe} data-testid="newsletter-form" className="mt-8 flex max-w-md gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  data-testid="newsletter-email-input"
                  className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm text-white placeholder:text-white/40 outline-none backdrop-blur-sm transition-colors duration-300 focus:border-brand-orange"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  data-testid="newsletter-submit-button"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Subscribe
                </motion.button>
              </form>
            </Reveal>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/40">Sitemap</p>
              <ul className="mt-5 space-y-3">
                {NAV_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} data-testid={`footer-link-${l.label.toLowerCase()}`} className="text-sm text-white/70 transition-colors duration-300 hover:text-brand-orange">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/40">Expertise</p>
              <ul className="mt-5 space-y-3">
                {SERVICES.slice(0, 6).map((s) => (
                  <li key={s.id}>
                    <Link to="/services" className="text-sm text-white/70 transition-colors duration-300 hover:text-brand-orange">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/40">Contact</p>
              <ul className="mt-5 space-y-3 text-sm text-white/70">
                <li><a href={`mailto:${CONTACT.sales}`} data-testid="footer-email-sales" className="transition-colors duration-300 hover:text-brand-orange">{CONTACT.sales}</a></li>
                <li><a href={`mailto:${CONTACT.general}`} data-testid="footer-email-general" className="transition-colors duration-300 hover:text-brand-orange">{CONTACT.general}</a></li>
                <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} data-testid="footer-phone" className="transition-colors duration-300 hover:text-brand-orange">{CONTACT.phone}</a></li>
                <li className="text-white/40">Incorporated in India</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p data-testid="footer-copyright">© 2026 OrynticLabs Private Limited. All rights reserved.</p>
          <p>Engineering intelligent software — SaaS · PaaS · Custom</p>
        </div>
      </div>
    </footer>
  );
}
