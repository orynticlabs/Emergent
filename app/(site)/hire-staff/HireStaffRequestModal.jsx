"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, User, Mail, Phone, Building2, Briefcase, Layers, Users, Clock, MessageSquare, Send, Loader2,
} from "lucide-react";
import { EASE } from "@site/components/site/Reveal";
import { siteAlertToast } from "@site/components/ui/site-alert-toast";
import { ROLES, ENGAGEMENT_MODELS } from "./hire-staff-data";

/*
 * Popup intake form for /hire-staff — same visual language as the
 * ContactClient hero form card (rounded-3xl, border-white/15,
 * bg-white/[0.06], backdrop-blur-xl, gradient top border, blurred orb,
 * icon-prefixed underline inputs) rather than a generic modal, so it
 * doesn't feel like a different product bolted onto the page. Submits to
 * OryCMS's "Hire Staff Requests" feature (Feature -> Hire Staff Requests
 * in the admin sidebar) via a public POST — visitors have no session, so
 * that one endpoint is exempted from the session check in middleware.ts.
 */

const inputCls =
  "w-full border-b border-white/15 bg-transparent py-3 pl-8 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-300 focus:border-brand-orange";

const selectCls = `${inputCls} appearance-none`;

const FieldRow = ({ icon: Icon, children }) => (
  <div className="group relative">
    <Icon className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-brand-orange" strokeWidth={1.75} />
    {children}
    <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-brand-orange transition-all duration-500 group-focus-within:w-full" aria-hidden="true" />
  </div>
);

const TEAM_SIZES = ["1 engineer", "2–5 engineers", "6–10 engineers", "10+ engineers"];
const TIMELINES = ["ASAP", "Within a month", "1–3 months", "Flexible"];

const FORM_DEFAULTS = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  engagementModel: "",
  teamSize: "",
  timeline: "",
  message: "",
};

export default function HireStaffRequestModal({ open, onClose, prefill = {} }) {
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...FORM_DEFAULTS, role: prefill.role ?? "", engagementModel: prefill.engagementModel ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post("/api/orycms/hire-staff-requests", form);
      siteAlertToast({
        title: "Request received",
        description: "Our team will get back to you within 24 hours.",
      });
      setForm(FORM_DEFAULTS);
      onClose();
    } catch (err) {
      siteAlertToast({
        title: "Something went wrong",
        description: err?.response?.data?.error?.message || "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            data-testid="hire-staff-modal-overlay"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4 md:p-6" role="dialog" aria-modal="true">
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              data-testid="hire-staff-modal"
              className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#0b0b0e]/95 bg-white/[0.06] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/70 to-transparent" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-brand-blue/20 blur-[90px]" aria-hidden="true" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                data-testid="hire-staff-modal-close"
                className="absolute right-5 top-5 z-10 text-white/40 transition-colors duration-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Hire Staff</p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Tell us who you need.
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                  Share the details and we'll start matching engineers within 48 hours.
                </p>

                <form onSubmit={submit} data-testid="hire-staff-request-form" className="mt-8 space-y-5">
                  <FieldRow icon={User}>
                    <input required placeholder="Full name *" value={form.name} onChange={set("name")} data-testid="hire-staff-input-name" className={inputCls} />
                  </FieldRow>
                  <FieldRow icon={Mail}>
                    <input required type="email" placeholder="Work email *" value={form.email} onChange={set("email")} data-testid="hire-staff-input-email" className={inputCls} suppressHydrationWarning />
                  </FieldRow>
                  <div className="grid grid-cols-2 gap-5">
                    <FieldRow icon={Phone}>
                      <input type="tel" placeholder="Phone" value={form.phone} onChange={set("phone")} data-testid="hire-staff-input-phone" className={inputCls} />
                    </FieldRow>
                    <FieldRow icon={Building2}>
                      <input placeholder="Company" value={form.company} onChange={set("company")} data-testid="hire-staff-input-company" className={inputCls} />
                    </FieldRow>
                  </div>

                  <FieldRow icon={Briefcase}>
                    <select value={form.role} onChange={set("role")} data-testid="hire-staff-input-role" className={selectCls}>
                      <option value="" className="bg-brand-ink">Role needed</option>
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.title} className="bg-brand-ink">{r.title}</option>
                      ))}
                      <option value="Other" className="bg-brand-ink">Other</option>
                    </select>
                  </FieldRow>

                  <FieldRow icon={Layers}>
                    <select value={form.engagementModel} onChange={set("engagementModel")} data-testid="hire-staff-input-engagement" className={selectCls}>
                      <option value="" className="bg-brand-ink">Engagement model</option>
                      {ENGAGEMENT_MODELS.map((m) => (
                        <option key={m.title} value={m.title} className="bg-brand-ink">{m.title}</option>
                      ))}
                    </select>
                  </FieldRow>

                  <div className="grid grid-cols-2 gap-5">
                    <FieldRow icon={Users}>
                      <select value={form.teamSize} onChange={set("teamSize")} data-testid="hire-staff-input-team-size" className={selectCls}>
                        <option value="" className="bg-brand-ink">Team size</option>
                        {TEAM_SIZES.map((t) => (
                          <option key={t} value={t} className="bg-brand-ink">{t}</option>
                        ))}
                      </select>
                    </FieldRow>
                    <FieldRow icon={Clock}>
                      <select value={form.timeline} onChange={set("timeline")} data-testid="hire-staff-input-timeline" className={selectCls}>
                        <option value="" className="bg-brand-ink">Timeline</option>
                        {TIMELINES.map((t) => (
                          <option key={t} value={t} className="bg-brand-ink">{t}</option>
                        ))}
                      </select>
                    </FieldRow>
                  </div>

                  <FieldRow icon={MessageSquare}>
                    <textarea
                      rows={3}
                      placeholder="Tech stack or anything else we should know"
                      value={form.message}
                      onChange={set("message")}
                      data-testid="hire-staff-input-message"
                      className={`${inputCls} resize-none`}
                    />
                  </FieldRow>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={sending}
                    data-testid="hire-staff-submit-button"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-bold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(255,85,0,0.55)] transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? "Sending..." : "Send request"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
