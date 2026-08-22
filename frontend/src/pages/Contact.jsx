import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Send, Mail, Phone, MapPin } from "lucide-react";
import { CONTACT, SERVICES } from "@/data/content";
import { PageHero, Reveal } from "@/components/site/Reveal";

const EMAILS = [
  { label: "Sales", value: CONTACT.sales },
  { label: "Support", value: CONTACT.support },
  { label: "General", value: CONTACT.general },
];

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-300 focus:border-brand-orange";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", service: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", company: "", service: "", message: "" });
      toast.success("Message received. Our team will reach out within 24 hours.");
    }, 900);
  };

  return (
    <main data-testid="contact-page">
      <PageHero
        overline="Contact"
        lines={["LET'S", "BUILD."]}
        accentIndex={1}
        description="Tell us what you are trying to solve. The people who read your message are the people who would build it."
      />

      <section className="bg-brand-paper py-24 text-brand-coal md:py-32" data-testid="contact-section">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Direct lines. <span className="text-brand-orange">No ticket queues.</span>
              </h2>
            </Reveal>
            <div className="mt-12 space-y-8">
              {EMAILS.map((e, i) => (
                <Reveal key={e.label} delay={0.08 * i}>
                  <a href={`mailto:${e.value}`} data-testid={`contact-email-${e.label.toLowerCase()}`} className="group flex items-center gap-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white transition-colors duration-300 group-hover:border-brand-orange">
                      <Mail className="h-5 w-5 text-brand-orange" strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[0.25em] text-black/40">{e.label}</span>
                      <span className="block font-medium text-brand-coal transition-colors duration-300 group-hover:text-brand-orange">{e.value}</span>
                    </span>
                  </a>
                </Reveal>
              ))}
              <Reveal delay={0.3}>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} data-testid="contact-phone" className="group flex items-center gap-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white transition-colors duration-300 group-hover:border-brand-blue">
                    <Phone className="h-5 w-5 text-brand-blue" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.25em] text-black/40">Phone</span>
                    <span className="block font-medium transition-colors duration-300 group-hover:text-brand-blue">{CONTACT.phone}</span>
                  </span>
                </a>
              </Reveal>
              <Reveal delay={0.35}>
                <div className="flex items-center gap-5" data-testid="contact-location">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white">
                    <MapPin className="h-5 w-5 text-brand-coal" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.25em] text-black/40">Registered</span>
                    <span className="block font-medium">Incorporated in India, under the Companies Act, 2013</span>
                  </span>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.15} className="lg:col-span-7">
            <form
              onSubmit={submit}
              data-testid="contact-form"
              className="rounded-3xl bg-brand-ink p-8 text-white md:p-12 glow-blue"
            >
              <h3 className="font-display text-2xl font-bold tracking-tight">Start a project</h3>
              <p className="mt-2 text-sm text-white/50">Fields marked with an asterisk are required.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <input required placeholder="Your name *" value={form.name} onChange={set("name")} data-testid="contact-input-name" className={inputCls} />
                <input required type="email" placeholder="Work email *" value={form.email} onChange={set("email")} data-testid="contact-input-email" className={inputCls} />
                <input placeholder="Company" value={form.company} onChange={set("company")} data-testid="contact-input-company" className={inputCls} />
                <select value={form.service} onChange={set("service")} data-testid="contact-input-service" className={`${inputCls} appearance-none`}>
                  <option value="" className="bg-brand-ink">What do you need?</option>
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.title} className="bg-brand-ink">{s.title}</option>
                  ))}
                  <option value="Staff Augmentation" className="bg-brand-ink">Staff Augmentation</option>
                  <option value="Consulting" className="bg-brand-ink">Technology Consulting</option>
                </select>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Tell us about the problem you are solving *"
                value={form.message}
                onChange={set("message")}
                data-testid="contact-input-message"
                className={`${inputCls} mt-5 resize-none`}
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={sending}
                data-testid="contact-submit-button"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-bold tracking-wide text-white transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60 sm:w-auto"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending..." : "Send message"}
              </motion.button>
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
