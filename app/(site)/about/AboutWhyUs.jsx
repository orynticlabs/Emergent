"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { TEAM_ROLES as ROLES } from "@site/data/content";
import { Reveal, SectionHead } from "@site/components/site/Reveal";
import { CanvasText } from "@site/components/ui/canvas-text";

function Bubble({ align = "left", delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse self-end" : "self-start"}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
          align === "right" ? "bg-brand-orange" : "bg-white/15"
        }`}
      >
        {align === "right" ? "US" : "PM"}
      </span>
      <span
        className={`max-w-[13rem] rounded-2xl px-3.5 py-2 text-xs leading-snug ${
          align === "right" ? "bg-brand-orange text-white" : "bg-white/10 text-white/80"
        }`}
      >
        {children}
      </span>
    </motion.div>
  );
}

function ChatScene({ messages }) {
  return (
    <div className="flex h-56 flex-col justify-end gap-2.5 overflow-hidden p-5">
      {messages.map((m, i) => (
        <Bubble key={i} align={m.align} delay={i * 0.15}>
          {m.text}
        </Bubble>
      ))}
    </div>
  );
}

function AvatarCluster() {
  return (
    <div className="relative flex h-56 items-center justify-center">
      {ROLES.map((r, i) => {
        const positions = [
          "left-[8%] top-[15%]", "right-[10%] top-[10%]", "left-1/2 top-[38%] -translate-x-1/2",
          "left-[14%] bottom-[12%]", "right-[16%] bottom-[15%]", "right-[2%] top-[45%]",
        ];
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            viewport={{ once: true }}
            transition={{
              opacity: { duration: 0.4, delay: i * 0.08 },
              scale: { duration: 0.4, delay: i * 0.08 },
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
            }}
            className={`absolute h-12 w-12 overflow-hidden rounded-full shadow-lg ring-2 ring-white/20 ${positions[i]}`}
          >
            <img src={r.image} alt={r.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </motion.div>
        );
      })}
    </div>
  );
}

function TeamList() {
  return (
    <div className="flex h-56 flex-col justify-center gap-3 p-5">
      {ROLES.slice(0, 4).map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
        >
          <img
            src={r.image}
            alt={r.name}
            loading="lazy"
            decoding="async"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">{r.name}</p>
            <p className="truncate text-[11px] text-white/50">{r.designation}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CallGrid() {
  return (
    <div className="grid h-56 grid-cols-3 gap-2.5 p-5">
      {ROLES.map((r, i) => {
        const muted = i % 3 === 1;
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative overflow-hidden rounded-lg border border-white/10"
          >
            <img src={r.image} alt={r.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
            >
              {muted ? <MicOff className="h-3 w-3 text-red-400" /> : <Mic className="h-3 w-3 text-emerald-400" />}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}

const GANTT_TASKS = [
  { label: "Sprint Planning", start: "5%", width: "22%", color: "bg-brand-orange/70" },
  { label: "Build & Review", start: "30%", width: "40%", color: "bg-brand-blue/70" },
  { label: "Friday Demo", start: "75%", width: "20%", color: "bg-emerald-500/70" },
];

function GanttScene() {
  return (
    <div className="relative flex h-56 flex-col justify-center gap-6 p-5">
      <div className="absolute inset-x-5 top-5 flex justify-between text-[10px] text-white/30">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      {GANTT_TASKS.map((t, i) => (
        <div key={t.label} className="relative h-8 w-full rounded-md bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: t.width }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
            style={{ marginLeft: t.start }}
            className={`absolute inset-y-0 flex items-center rounded-md px-2.5 text-[10px] font-semibold text-white ${t.color}`}
          >
            {t.label}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

const CARDS = [
  {
    title: "Direct Communication",
    text: "No account managers relaying messages. You talk to the engineers building your product, directly.",
    scene: (
      <ChatScene
        messages={[
          { align: "left", text: "did the API integration ship?" },
          { align: "right", text: "yes, PR is up for review" },
          { align: "left", text: "can you share the link?" },
          { align: "right", text: "sure, here it is." },
        ]}
      />
    ),
  },
  {
    title: "Honest When It's Not Working",
    text: "If an approach is wrong, we say so - even mid-project. You hear it early, never when it's too late to adjust.",
    scene: (
      <ChatScene
        messages={[
          { align: "left", text: "this approach won't scale past 10k users" },
          { align: "right", text: "how do you want to proceed?" },
          { align: "left", text: "let's jump on a call" },
          { align: "right", text: "sending options now." },
        ]}
      />
    ),
  },
  {
    title: "One Team, Under One Roof",
    text: "Web, mobile, AI, cloud, and design - all in-house, coordinating on the same project without handoffs.",
    scene: <AvatarCluster />,
  },
  {
    title: "Founders Stay Involved",
    text: "The people on your kickoff call are the people who stay on your project - no disappearing after the sale.",
    scene: <TeamList />,
  },
  {
    title: "A Live Demo, Every Friday",
    text: "Two-week sprints end in a real, working demo - not a status report. You see progress, not promises.",
    scene: <CallGrid />,
  },
  {
    title: "Two-Week Sprints, Fully Visible",
    text: "Every sprint is scoped and scheduled up front, so you always know what's shipping and when.",
    scene: <GanttScene />,
  },
];

export default function AboutWhyUs() {
  return (
    <section className="border-t border-white/5 bg-brand-ink py-24 text-white md:py-32" data-testid="about-why-choose">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHead
          align="center"
          titleClassName="text-2xl md:text-7xl uppercase"
          wrapperClassName="max-w-4xl"
          title={
            <>
              Why choose us
              <br />
              <CanvasText
                text="over others?"
                className="font-display text-2xl font-black uppercase md:text-7xl"
                colors={["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"]}
                lineGap={6}
                animationDuration={10}
              />
            </>
          }
          description="More than a vendor relationship - direct access to the people building your product, honest communication, and a process you can actually see."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={0.06 * i}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-brand-orange/40">
                {c.scene}
                <div className="border-t border-white/10 p-6">
                  <h3 className="font-display text-lg font-bold tracking-tight text-white">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{c.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
