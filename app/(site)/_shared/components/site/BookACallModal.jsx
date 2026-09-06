"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, User, Mail, Phone, Building2, MessageSquare, Send, Loader2,
  ArrowLeft, CalendarDays, Clock, CheckCircle2, Copy, Video,
} from "lucide-react";
import { EASE } from "@site/components/site/Reveal";
import { siteAlertToast } from "@site/components/ui/site-alert-toast";
import { useBookingModal } from "@site/components/site/BookingModalContext";

/*
 * Site-wide "Book a Call" popup — same visual language as the Hire Staff
 * request modal (rounded-3xl, border-white/15, bg-white/[0.06],
 * backdrop-blur-xl, gradient top border, blurred orb, icon-prefixed
 * underline inputs), reused rather than a generic dialog. Three internal
 * steps: pick a date -> pick an open time slot -> contact details ->
 * confirmation (with the auto-generated Jitsi meeting link). Backed by
 * OryCMS's Bookings/Availability feature (Engagements -> Bookings /
 * Availability in the admin sidebar) via public read/create endpoints.
 */

const inputCls =
  "w-full border-b border-white/15 bg-transparent py-3 pl-8 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-300 focus:border-brand-orange";

const FieldRow = ({ icon: Icon, children }) => (
  <div className="group relative">
    <Icon className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-brand-orange" strokeWidth={1.75} />
    {children}
    <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-brand-orange transition-all duration-500 group-focus-within:w-full" aria-hidden="true" />
  </div>
);

const FORM_DEFAULTS = { name: "", email: "", phone: "", company: "", notes: "" };

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildCandidateDates(days, windowDays) {
  const enabledWeekdays = new Set((days || []).filter((d) => d.enabled).map((d) => d.weekday));
  const out = [];
  const today = new Date();
  for (let i = 0; i < Math.max(windowDays || 0, 0) + 1 && out.length < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (enabledWeekdays.has(d.getDay())) out.push(d);
  }
  return out;
}

export default function BookACallModal() {
  const { open, closeModal } = useBookingModal();
  const [step, setStep] = useState("date"); // date -> slot -> details -> success
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    if (!open) return;
    setStep("date");
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setForm(FORM_DEFAULTS);
    setConfirmed(null);
    axios
      .get("/api/orycms/bookings/availability/public")
      .then((res) => setAvailability(res.data?.data ?? null))
      .catch(() => setAvailability(null));
  }, [open]);

  const candidateDates = useMemo(
    () => (availability ? buildCandidateDates(availability.days, availability.bookingWindowDays) : []),
    [availability],
  );

  const pickDate = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);
    axios
      .get(`/api/orycms/bookings/slots/public`, { params: { date: dateKey(date) } })
      .then((res) => setSlots(res.data?.data?.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
    setStep("slot");
  };

  const pickSlot = (slot) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSending(true);
    try {
      const res = await axios.post("/api/orycms/bookings/public", {
        ...form,
        start: selectedSlot.start,
        end: selectedSlot.end,
        visitorTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setConfirmed(res.data?.data ?? null);
      setStep("success");
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === "SLOT_TAKEN") {
        siteAlertToast({
          title: "That time was just taken",
          description: "Please pick another slot for the same day.",
          variant: "error",
        });
        if (selectedDate) pickDate(selectedDate);
        setStep("slot");
      } else {
        siteAlertToast({
          title: "Something went wrong",
          description: err?.response?.data?.error?.message || "Please try again in a moment.",
          variant: "error",
        });
      }
    } finally {
      setSending(false);
    }
  };

  const copyMeetingLink = () => {
    if (!confirmed?.meetingUrl) return;
    navigator.clipboard?.writeText(confirmed.meetingUrl).then(() => {
      siteAlertToast({ title: "Link copied" });
    });
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
            onClick={closeModal}
            data-testid="book-call-modal-overlay"
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
              data-testid="book-call-modal"
              className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#0b0b0e]/95 bg-white/[0.06] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/70 to-transparent" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-brand-blue/20 blur-[90px]" aria-hidden="true" />

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                data-testid="book-call-modal-close"
                className="absolute right-5 top-5 z-10 text-white/40 transition-colors duration-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Book a Call</p>

                {step === "date" && (
                  <>
                    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">Pick a day.</h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">Choose a day that works — we'll show open times next.</p>
                    <div className="mt-7 grid max-h-72 grid-cols-3 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-4" data-testid="book-call-date-grid">
                      {availability === null && (
                        <p className="col-span-full py-6 text-center text-sm text-white/50">Loading availability…</p>
                      )}
                      {availability && candidateDates.length === 0 && (
                        <p className="col-span-full py-6 text-center text-sm text-white/50">No availability configured yet.</p>
                      )}
                      {candidateDates.map((d) => (
                        <button
                          key={dateKey(d)}
                          type="button"
                          onClick={() => pickDate(d)}
                          data-testid={`book-call-date-${dateKey(d)}`}
                          className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] py-3 transition-colors duration-300 hover:border-brand-orange/50 hover:bg-white/[0.06]"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            {d.toLocaleDateString(undefined, { weekday: "short" })}
                          </span>
                          <span className="mt-1 font-display text-lg font-bold text-white">{d.getDate()}</span>
                          <span className="text-[10px] text-white/40">{d.toLocaleDateString(undefined, { month: "short" })}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === "slot" && selectedDate && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep("date")}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-300 hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change day
                    </button>
                    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                    </h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">Times shown in your local timezone.</p>
                    <div className="mt-7 grid max-h-72 grid-cols-3 gap-2.5 overflow-y-auto pr-1" data-testid="book-call-slot-grid">
                      {slotsLoading && <p className="col-span-full py-6 text-center text-sm text-white/50">Loading times…</p>}
                      {!slotsLoading && slots.length === 0 && (
                        <p className="col-span-full py-6 text-center text-sm text-white/50">No times available this day — try another date.</p>
                      )}
                      {!slotsLoading &&
                        slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => pickSlot(slot)}
                            data-testid={`book-call-slot-${slot.start}`}
                            className="rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-brand-orange/50 hover:bg-white/[0.06] hover:text-white"
                          >
                            {new Date(slot.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </button>
                        ))}
                    </div>
                  </>
                )}

                {step === "details" && selectedSlot && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep("slot")}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-300 hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change time
                    </button>
                    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">Your details.</h2>
                    <div className="mt-3 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-brand-orange" />{selectedDate?.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand-orange" />{new Date(selectedSlot.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                    </div>

                    <form onSubmit={submit} data-testid="book-call-form" className="mt-6 space-y-5">
                      <FieldRow icon={User}>
                        <input required placeholder="Full name *" value={form.name} onChange={set("name")} data-testid="book-call-input-name" className={inputCls} />
                      </FieldRow>
                      <FieldRow icon={Mail}>
                        <input required type="email" placeholder="Work email *" value={form.email} onChange={set("email")} data-testid="book-call-input-email" className={inputCls} suppressHydrationWarning />
                      </FieldRow>
                      <div className="grid grid-cols-2 gap-5">
                        <FieldRow icon={Phone}>
                          <input type="tel" placeholder="Phone" value={form.phone} onChange={set("phone")} data-testid="book-call-input-phone" className={inputCls} />
                        </FieldRow>
                        <FieldRow icon={Building2}>
                          <input placeholder="Company" value={form.company} onChange={set("company")} data-testid="book-call-input-company" className={inputCls} />
                        </FieldRow>
                      </div>
                      <FieldRow icon={MessageSquare}>
                        <textarea
                          rows={3}
                          placeholder="What would you like to discuss?"
                          value={form.notes}
                          onChange={set("notes")}
                          data-testid="book-call-input-notes"
                          className={`${inputCls} resize-none`}
                        />
                      </FieldRow>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={sending}
                        data-testid="book-call-submit-button"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-bold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(255,85,0,0.55)] transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {sending ? "Booking..." : "Confirm booking"}
                      </motion.button>
                    </form>
                  </>
                )}

                {step === "success" && confirmed && (
                  <div data-testid="book-call-success" className="text-center">
                    <div className="mx-auto mt-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">You're booked.</h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                      {new Date(confirmed.startAt).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>

                    {confirmed.meetingUrl && (
                      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Video call link</p>
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={confirmed.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="book-call-join-link"
                            className="min-w-0 flex-1 truncate text-sm font-medium text-brand-blue hover:underline"
                          >
                            {confirmed.meetingUrl}
                          </a>
                          <button
                            type="button"
                            onClick={copyMeetingLink}
                            aria-label="Copy meeting link"
                            className="shrink-0 rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <a
                          href={confirmed.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-bold text-white transition-colors duration-300 hover:bg-[#0052cc]"
                        >
                          <Video className="h-4 w-4" />
                          Join call
                        </a>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={closeModal}
                      data-testid="book-call-done-button"
                      className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-300 hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
