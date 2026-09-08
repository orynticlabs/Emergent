"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, Mail, Phone, MapPin, User, Building2, Layers, MessageSquare, ShieldCheck, MessageCircle, Check, Paperclip, FileText, X, Headphones, AtSign } from "lucide-react";
import { CONTACT, SERVICES, IMAGES, CONTACT_FAQS, CLIENTS } from "@site/data/content";
import { Reveal, EASE } from "@site/components/site/Reveal";
import FAQGrid from "@site/components/site/FAQGrid";
import { WorldMap } from "@site/components/ui/world-map";
import { siteAlertToast } from "@site/components/ui/site-alert-toast";
import { cn } from "@site/lib/utils";

const CONTACT_FEATURES = [
  { title: "Sales Email", value: CONTACT.sales, href: `mailto:${CONTACT.sales}`, icon: Mail },
  { title: "Support Email", value: CONTACT.support, href: `mailto:${CONTACT.support}`, icon: Headphones },
  { title: "General Enquiries", value: CONTACT.general, href: `mailto:${CONTACT.general}`, icon: AtSign },
  { title: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}`, icon: Phone },
  { title: "Registered Office", value: "Incorporated in India, under the Companies Act, 2013", icon: MapPin },
];

function ContactFeature({ icon: Icon, title, value, href, index }) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href, "data-testid": `contact-feature-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` } : { "data-testid": `contact-feature-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` })}
      className={cn(
        "group/feature relative flex flex-col px-6 py-10 lg:border-r lg:border-white/10 lg:last:border-r-0",
        index === 0 && "lg:border-l"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/[0.04] to-transparent opacity-0 transition duration-300 group-hover/feature:opacity-100" aria-hidden="true" />
      <div className="relative z-10 mb-4 text-white/40 transition-colors duration-300 group-hover/feature:text-brand-orange">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div className="relative z-10 pl-4 text-xs font-bold uppercase tracking-[0.25em] text-white/40">
        <span className="absolute inset-y-0 left-0 my-auto h-6 w-1 origin-center rounded-full bg-white/15 transition-all duration-300 group-hover/feature:h-8 group-hover/feature:bg-brand-orange" aria-hidden="true" />
        <span className="inline-block transition-transform duration-300 group-hover/feature:translate-x-1">{title}</span>
      </div>
      <p className="relative z-10 mt-2 max-w-xs pl-4 text-sm font-medium text-white/85 transition-colors duration-300 group-hover/feature:text-white">{value}</p>
    </Wrapper>
  );
}

const OFFICE_ROUTES = [
  { start: { lat: 24.5362, lng: 81.2961 }, end: { lat: 28.4595, lng: 77.0266 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: 51.5074, lng: -0.1278 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: 40.7128, lng: -74.006 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: 25.2048, lng: 55.2708 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: 1.3521, lng: 103.8198 } },
  { start: { lat: 28.4595, lng: 77.0266 }, end: { lat: -33.8688, lng: 151.2093 } },
];

const NEXT_STEPS = [
  "A member of our team reaches out within 24 hours.",
  "We listen to your requirements and ask the right questions.",
  "You get a scoped plan, or a free consultation call.",
];

const inputCls =
  "w-full border-b border-white/15 bg-transparent py-3 pl-8 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-300 focus:border-brand-orange";

const FieldRow = ({ icon: Icon, children }) => (
  <div className="group relative">
    <Icon className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-brand-orange" strokeWidth={1.75} />
    {children}
    <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-brand-orange transition-all duration-500 group-focus-within:w-full" aria-hidden="true" />
  </div>
);

const CheckField = ({ icon: Icon, checked, onChange, testId, children }) => (
  <label className="group flex cursor-pointer items-start gap-3" data-testid={testId}>
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-300 ${
        checked ? "border-brand-orange bg-brand-orange" : "border-white/25 bg-white/5 group-hover:border-white/40"
      }`}
    >
      <motion.span initial={false} animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: 0.15 }}>
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </motion.span>
    </button>
    <span className="flex items-start gap-2 text-xs leading-relaxed text-white/60">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" strokeWidth={1.75} />
      {children}
    </span>
  </label>
);

const FileField = ({ file, onSelect, onClear }) => (
  <div>
    <label
      htmlFor="contact-file-input"
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-3.5 text-sm text-white/50 transition-colors duration-300 hover:border-brand-orange hover:text-white/80"
    >
      <Paperclip className="h-4 w-4 shrink-0 text-white/30 transition-colors duration-300 group-hover:text-brand-orange" strokeWidth={1.75} />
      {file ? "Replace file" : "Attach a brief, deck, or spec (PDF, DOC)"}
      <input
        id="contact-file-input"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onSelect}
        data-testid="contact-input-file"
        className="hidden"
      />
    </label>
    {file && (
      <div className="mt-2.5 flex items-center gap-2 text-xs text-white/60" data-testid="contact-file-name">
        <FileText className="h-3.5 w-3.5 shrink-0 text-brand-orange" strokeWidth={1.75} />
        <span className="truncate">{file.name}</span>
        <button type="button" onClick={onClear} aria-label="Remove attachment" className="ml-auto shrink-0 text-white/40 transition-colors duration-300 hover:text-white">
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    )}
  </div>
);

function ContactHero({ form, sending, submit, set, toggle, file, onFileSelect, onFileClear }) {
  return (
    <section data-testid="page-hero" className="relative overflow-hidden bg-brand-ink text-white">
      <img src={IMAGES.culture} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-brand-ink/70" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/40 via-brand-ink/60 to-brand-ink" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 pt-36 pb-20 md:px-10 md:pt-44 md:pb-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="font-display text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
            >
              Take the first step <span className="text-brand-orange">toward what you&apos;re building.</span>
            </motion.h1>

            <Reveal delay={0.15}>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-white/50">What happens next?</p>
              <ol className="mt-5 space-y-4">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-white/80">{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="mt-8 max-w-xl leading-relaxed text-white/60">
                Fill out the form and our team will respond within one business day. You can also reach us directly at{" "}
                <a
                  href={`mailto:${CONTACT.sales}`}
                  className="font-semibold text-white underline decoration-brand-orange/60 underline-offset-4 transition-colors duration-300 hover:text-brand-orange"
                >
                  {CONTACT.sales}
                </a>
                .
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-12">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Trusted by</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-3">
                  {CLIENTS.slice(0, 4).map((c) => (
                    <span key={c.name} className={`text-lg text-white/50 ${c.cls}`}>{c.name}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:col-span-5">
            <motion.form
              whileHover={{ y: -2 }}
              transition={{ duration: 0.4, ease: EASE }}
              onSubmit={submit}
              data-testid="contact-form"
              className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/70 to-transparent" aria-hidden="true" />
              <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-brand-blue/20 blur-[90px]" aria-hidden="true" />

              <div className="relative">
                <div className="space-y-6">
                  <FieldRow icon={User}>
                    <input required placeholder="Full name *" value={form.name} onChange={set("name")} data-testid="contact-input-name" className={inputCls} />
                  </FieldRow>
                  <FieldRow icon={Mail}>
                    <input required type="email" placeholder="Work email *" value={form.email} onChange={set("email")} data-testid="contact-input-email" className={inputCls} suppressHydrationWarning />
                  </FieldRow>
                  <FieldRow icon={Building2}>
                    <input placeholder="Company" value={form.company} onChange={set("company")} data-testid="contact-input-company" className={inputCls} />
                  </FieldRow>
                  <FieldRow icon={Layers}>
                    <select value={form.service} onChange={set("service")} data-testid="contact-input-service" className={`${inputCls} appearance-none`}>
                      <option value="" className="bg-brand-ink">What do you need?</option>
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title} className="bg-brand-ink">{s.title}</option>
                      ))}
                      <option value="Staff Augmentation" className="bg-brand-ink">Staff Augmentation</option>
                      <option value="Consulting" className="bg-brand-ink">Technology Consulting</option>
                    </select>
                  </FieldRow>
                  <FieldRow icon={MessageSquare}>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us about the problem you are solving *"
                      value={form.message}
                      onChange={set("message")}
                      data-testid="contact-input-message"
                      className={`${inputCls} resize-none`}
                    />
                  </FieldRow>
                  <FileField file={file} onSelect={onFileSelect} onClear={onFileClear} />
                </div>

                <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                  <CheckField icon={ShieldCheck} checked={form.nda} onChange={toggle("nda")} testId="contact-check-nda">
                    I want to protect my business idea by signing an NDA.
                  </CheckField>
                  <CheckField icon={MessageCircle} checked={form.consent} onChange={toggle("consent")} testId="contact-check-consent">
                    I agree to receive SMS and WhatsApp updates about my enquiry.
                  </CheckField>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={sending}
                  data-testid="contact-submit-button"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-bold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(255,85,0,0.55)] transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending..." : "Submit"}
                </motion.button>
              </div>
            </motion.form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const FORM_DEFAULTS = { name: "", email: "", company: "", service: "", message: "", nda: false, consent: true };

export default function ContactClient() {
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggle = (k) => () => setForm({ ...form, [k]: !form[k] });
  const onFileSelect = (e) => setFile(e.target.files?.[0] || null);
  const onFileClear = () => setFile(null);

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm(FORM_DEFAULTS);
      setFile(null);
      siteAlertToast({
        title: "Message received",
        description: form.nda
          ? "We'll send over an NDA before our first call."
          : "Our team will reach out within 24 hours.",
      });
    }, 900);
  };

  return (
    <main data-testid="contact-page">
      <ContactHero
        form={form}
        sending={sending}
        submit={submit}
        set={set}
        toggle={toggle}
        file={file}
        onFileSelect={onFileSelect}
        onFileClear={onFileClear}
      />

      <section className="bg-brand-ink py-20 text-white md:py-24" data-testid="contact-section">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Direct lines. <span className="text-brand-orange">No ticket queues.</span>
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-white/60">
              Whether you're scoping a new web platform, adding AI to an existing product, or need
              engineers to sit inside your team for a few months, there's a direct line below for
              it - sales for new work, support if you're already a client, and a phone number if
              you'd rather just talk it through.
            </p>
          </Reveal>
          <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {CONTACT_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.06 * i}>
                <ContactFeature {...f} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink py-4 text-white md:py-8" data-testid="contact-world-map">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="text-center font-display text-2xl font-bold md:text-4xl">
              Rooted in India. <span className="text-brand-orange">Built to work with the world.</span>
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-white/50 md:text-base">
              Our team works out of Gurugram and Rewa, delivering for clients across time zones -
              no matter where you are, you get the same team on every call.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10">
              <WorldMap dots={OFFICE_ROUTES} />
            </div>
          </Reveal>
        </div>
      </section>

      <FAQGrid
        testId="contact-faq"
        items={CONTACT_FAQS}
        description={
          <>
            We're here to help with anything you're unsure about. If you don't find what you need,
            write to us directly at{" "}
            <a
              href={`mailto:${CONTACT.support}`}
              className="font-semibold text-brand-orange underline underline-offset-4 transition-colors duration-300 hover:text-white"
            >
              {CONTACT.support}
            </a>
            .
          </>
        }
      />
    </main>
  );
}
