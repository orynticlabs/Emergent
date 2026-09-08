"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, User, Mail, Phone, Building2, Briefcase, Layers, Users, Clock, MessageSquare, Send, Loader2, ChevronDown, Check,
} from "lucide-react";
import { EASE } from "@site/components/site/Reveal";
import { siteAlertToast } from "@site/components/ui/site-alert-toast";
import { ROLES, ENGAGEMENT_MODELS } from "./hire-staff-data";

/*
 * Popup intake form for /hire-staff - same visual language as the
 * ContactClient hero form card (rounded-3xl, border-white/15,
 * bg-white/[0.06], backdrop-blur-xl, gradient top border, blurred orb,
 * icon-prefixed underline inputs) rather than a generic modal, so it
 * doesn't feel like a different product bolted onto the page. Submits to
 * OryCMS's "Hire Staff Requests" feature (Feature -> Hire Staff Requests
 * in the admin sidebar) via a public POST - visitors have no session, so
 * that one endpoint is exempted from the session check in middleware.ts.
 */

const inputCls =
  "w-full border-b border-white/15 bg-transparent py-2.5 pl-7 pr-2 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-300 focus:border-brand-orange";

const FieldRow = ({ icon: Icon, children, isTextarea = false, className = "" }) => (
  <div className={`group relative ${className}`}>
    <Icon
      className={`pointer-events-none absolute left-0 text-white/30 transition-colors duration-300 group-focus-within:text-brand-orange ${
        isTextarea ? "top-3 h-4 w-4" : "top-1/2 h-4 w-4 -translate-y-1/2"
      }`}
      strokeWidth={1.75}
    />
    {children}
    <span
      className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-brand-orange transition-all duration-500 group-focus-within:w-full"
      aria-hidden="true"
    />
  </div>
);

const CustomSelect = ({
  value,
  onChange,
  placeholder,
  options,
  testId,
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel = options.find((o) => (typeof o === "string" ? o === value : o.value === value));
  const displayText = typeof selectedLabel === "object" ? selectedLabel?.label : selectedLabel;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between border-b bg-transparent py-2.5 pl-7 pr-1 text-left text-sm text-white outline-none transition-colors duration-300 hover:border-white/30 ${
          hasError
            ? "border-red-500/80 text-red-200"
            : "border-white/15 focus:border-brand-orange"
        }`}
      >
        <span className={`truncate ${displayText ? "text-white" : hasError ? "text-red-400/80" : "text-white/35"}`}>
          {displayText || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-brand-orange"
              : hasError
                ? "text-red-400/80"
                : "text-white/40 group-hover:text-white/70"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="absolute left-0 right-0 top-full z-[120] mt-1.5 max-h-56 overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#14141a]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl scrollbar-thin scrollbar-thumb-white/10"
          >
            {options.map((opt) => {
              const optVal = typeof opt === "string" ? opt : opt.value;
              const optLabel = typeof opt === "string" ? opt : opt.label;
              const isSelected = value === optVal;

              return (
                <button
                  key={optVal}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className={`group/item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs sm:text-sm transition-all duration-150 ${
                    isSelected
                      ? "bg-brand-orange/15 font-medium text-brand-orange"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-brand-orange" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        ...FORM_DEFAULTS,
        role: prefill.role ?? "",
        engagementModel: prefill.engagementModel ?? "",
      });
      setErrors({});
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, prefill]);

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const setValue = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Client-side validation: all fields are compulsory
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.email.trim()) newErrors.email = true;
    if (!form.phone.trim()) newErrors.phone = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!form.role.trim()) newErrors.role = true;
    if (!form.engagementModel.trim()) newErrors.engagementModel = true;
    if (!form.teamSize.trim()) newErrors.teamSize = true;
    if (!form.timeline.trim()) newErrors.timeline = true;
    if (!form.message.trim()) newErrors.message = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      siteAlertToast({
        title: "Missing required information",
        description: "Please fill in all fields before sending your request.",
        variant: "error",
      });
      return;
    }

    setSending(true);
    try {
      await axios.post("/api/orycms/hire-staff-requests", form);
      siteAlertToast({
        title: "Request received",
        description: "Our team will get back to you within 24 hours.",
      });
      setForm(FORM_DEFAULTS);
      setErrors({});
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

  const roleOptions = [
    ...ROLES.map((r) => ({ value: r.title, label: r.title })),
    { value: "Other", label: "Other" },
  ];
  const engagementOptions = ENGAGEMENT_MODELS.map((m) => ({ value: m.title, label: m.title }));
  const teamSizeOptions = TEAM_SIZES.map((t) => ({ value: t, label: t }));
  const timelineOptions = TIMELINES.map((t) => ({ value: t, label: t }));

  return (
    <AnimatePresence>
      {open && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[100] flex min-h-full items-center justify-center overflow-y-auto overscroll-contain bg-black/80 p-3 backdrop-blur-md sm:p-5 md:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            data-testid="hire-staff-modal"
            className="relative my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0e0e12] p-6 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-8"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/70 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-brand-blue/20 blur-[90px]" aria-hidden="true" />

            {/* Header (pinned at top of modal) */}
            <div className="relative shrink-0 pr-8">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                data-testid="hire-staff-modal-close"
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Hire Staff</p>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                Tell us who you need.
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-white/55">
                Share the details and we'll start matching engineers within 48 hours.
              </p>
            </div>

            {/* Scrollable form body */}
            <div data-lenis-prevent className="mt-5 flex-1 overflow-y-auto overscroll-contain pr-1 sm:pr-2">
              <form onSubmit={submit} data-testid="hire-staff-request-form" className="space-y-4 pb-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldRow icon={User}>
                    <input
                      required
                      placeholder="Full name *"
                      value={form.name}
                      onChange={set("name")}
                      data-testid="hire-staff-input-name"
                      className={`${inputCls} ${errors.name ? "border-red-500/80 placeholder:text-red-300/50" : ""}`}
                    />
                  </FieldRow>
                  <FieldRow icon={Mail}>
                    <input
                      required
                      type="email"
                      placeholder="Work email *"
                      value={form.email}
                      onChange={set("email")}
                      data-testid="hire-staff-input-email"
                      className={`${inputCls} ${errors.email ? "border-red-500/80 placeholder:text-red-300/50" : ""}`}
                      suppressHydrationWarning
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldRow icon={Phone}>
                    <input
                      required
                      type="tel"
                      placeholder="Phone *"
                      value={form.phone}
                      onChange={set("phone")}
                      data-testid="hire-staff-input-phone"
                      className={`${inputCls} ${errors.phone ? "border-red-500/80 placeholder:text-red-300/50" : ""}`}
                    />
                  </FieldRow>
                  <FieldRow icon={Building2}>
                    <input
                      required
                      placeholder="Company *"
                      value={form.company}
                      onChange={set("company")}
                      data-testid="hire-staff-input-company"
                      className={`${inputCls} ${errors.company ? "border-red-500/80 placeholder:text-red-300/50" : ""}`}
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldRow icon={Briefcase}>
                    <CustomSelect
                      value={form.role}
                      onChange={setValue("role")}
                      placeholder="Role needed *"
                      options={roleOptions}
                      testId="hire-staff-input-role"
                      hasError={Boolean(errors.role)}
                    />
                  </FieldRow>

                  <FieldRow icon={Layers}>
                    <CustomSelect
                      value={form.engagementModel}
                      onChange={setValue("engagementModel")}
                      placeholder="Engagement model *"
                      options={engagementOptions}
                      testId="hire-staff-input-engagement"
                      hasError={Boolean(errors.engagementModel)}
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldRow icon={Users}>
                    <CustomSelect
                      value={form.teamSize}
                      onChange={setValue("teamSize")}
                      placeholder="Team size *"
                      options={teamSizeOptions}
                      testId="hire-staff-input-team-size"
                      hasError={Boolean(errors.teamSize)}
                    />
                  </FieldRow>
                  <FieldRow icon={Clock}>
                    <CustomSelect
                      value={form.timeline}
                      onChange={setValue("timeline")}
                      placeholder="Timeline *"
                      options={timelineOptions}
                      testId="hire-staff-input-timeline"
                      hasError={Boolean(errors.timeline)}
                    />
                  </FieldRow>
                </div>

                <FieldRow icon={MessageSquare} isTextarea>
                  <textarea
                    required
                    rows={2}
                    placeholder="Tech stack or description of what you're building *"
                    value={form.message}
                    onChange={set("message")}
                    data-testid="hire-staff-input-message"
                    className={`${inputCls} resize-none ${errors.message ? "border-red-500/80 placeholder:text-red-300/50" : ""}`}
                  />
                </FieldRow>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={sending}
                  data-testid="hire-staff-submit-button"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(255,85,0,0.55)] transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending..." : "Send request"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
