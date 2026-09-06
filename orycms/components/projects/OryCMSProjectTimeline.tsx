"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchJson } from "./OryCMSProjectsAdminPage";
import { TaskTypeIcon, type OryCMSProjectTask } from "./task-types";

interface BlockingPair {
  blockerId: string;
  blockedId: string;
}

const DAY_WIDTH = 32;
const ROW_HEIGHT = 40;
const PAD_DAYS = 3;
const HEADER_HEIGHT = 44;

const BAR_COLOR: Record<OryCMSProjectTask["status"], string> = {
  todo: "bg-muted-foreground/50",
  in_progress: "bg-info",
  in_review: "bg-warning",
  done: "bg-success",
};

function toDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function OryCMSProjectTimeline({
  projectId,
  tasks,
  projectStartDate,
  projectDueDate,
  onOpen,
}: {
  projectId: string;
  tasks: OryCMSProjectTask[];
  projectStartDate: string | null;
  projectDueDate: string | null;
  onOpen: (task: OryCMSProjectTask) => void;
}) {
  const [blockingPairs, setBlockingPairs] = useState<BlockingPair[]>([]);

  useEffect(() => {
    fetchJson<BlockingPair[]>(`/api/orycms/projects/${projectId}/relations`)
      .then(setBlockingPairs)
      .catch(() => {});
  }, [projectId]);

  const candidateDates = [
    toDate(projectStartDate),
    toDate(projectDueDate),
    ...tasks.flatMap((t) => [toDate(t.startDate), toDate(t.dueDate)]),
  ].filter((d): d is Date => d !== null);

  const today = new Date(new Date().toDateString());
  const rangeStart = addDays(
    candidateDates.length ? new Date(Math.min(...candidateDates.map((d) => d.getTime()))) : addDays(today, -7),
    -PAD_DAYS,
  );
  const rangeEndRaw = candidateDates.length
    ? new Date(Math.max(...candidateDates.map((d) => d.getTime())))
    : addDays(today, 21);
  const rangeEnd = addDays(rangeEndRaw, PAD_DAYS);
  const totalDays = Math.max(1, daysBetween(rangeStart, rangeEnd) + 1);
  const totalWidth = totalDays * DAY_WIDTH;

  // Month header groups: contiguous runs of days sharing a month.
  const monthGroups: { label: string; days: number }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(rangeStart, i);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    const last = monthGroups[monthGroups.length - 1];
    if (last && last.label === label) last.days += 1;
    else monthGroups.push({ label, days: 1 });
  }

  const rows: { task: OryCMSProjectTask; isSubtask: boolean }[] = [];
  for (const task of tasks.filter((t) => !t.parentId)) {
    rows.push({ task, isSubtask: false });
    for (const child of tasks.filter((t) => t.parentId === task.id)) {
      rows.push({ task: child, isSubtask: true });
    }
  }

  const todayOffset = daysBetween(rangeStart, today);

  // Anchor points (left/right x, mid y) for each task's bar or marker, keyed
  // by task id — shared between the bar/marker rendering below and the
  // dependency-arrow overlay so arrows always line up with what's drawn.
  const anchors = new Map<string, { left: number; right: number; y: number }>();
  rows.forEach(({ task }, i) => {
    const start = toDate(task.startDate);
    const due = toDate(task.dueDate);
    const y = HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2;
    if (start && due) {
      const left = daysBetween(rangeStart, start) * DAY_WIDTH;
      const width = Math.max(1, daysBetween(start, due) + 1) * DAY_WIDTH - 4;
      anchors.set(task.id, { left, right: left + width, y });
    } else if (due) {
      const center = daysBetween(rangeStart, due) * DAY_WIDTH + DAY_WIDTH / 2;
      anchors.set(task.id, { left: center - 6, right: center + 6, y });
    }
  });
  const arrows = blockingPairs
    .map(({ blockerId, blockedId }) => {
      const from = anchors.get(blockerId);
      const to = anchors.get(blockedId);
      return from && to ? { from, to } : null;
    })
    .filter((a): a is { from: { left: number; right: number; y: number }; to: { left: number; right: number; y: number } } => a !== null);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex">
        {/* Fixed label column */}
        <div className="w-[220px] shrink-0 border-r border-border">
          <div style={{ height: 44 }} className="border-b border-border" />
          {rows.length === 0 && (
            <div style={{ height: ROW_HEIGHT }} className="flex items-center px-3 text-[12px] text-muted-foreground">
              No tasks yet.
            </div>
          )}
          {rows.map(({ task, isSubtask }) => (
            <button
              key={task.id}
              onClick={() => onOpen(task)}
              style={{ height: ROW_HEIGHT }}
              className={cn(
                "flex w-full items-center gap-1.5 border-b border-border px-3 text-left text-[12.5px] hover:bg-accent/30",
                isSubtask && "pl-6 text-muted-foreground",
              )}
            >
              <TaskTypeIcon type={task.type} className="h-3.5 w-3.5" />
              <span className="truncate">{task.title}</span>
            </button>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div className="flex-1 overflow-x-auto">
          <div style={{ width: totalWidth }} className="relative">
            {/* Month header */}
            <div className="flex border-b border-border" style={{ height: 24 }}>
              {monthGroups.map((g, i) => (
                <div
                  key={i}
                  style={{ width: g.days * DAY_WIDTH }}
                  className="shrink-0 truncate border-r border-border px-2 text-[10.5px] font-medium text-muted-foreground"
                >
                  {g.label}
                </div>
              ))}
            </div>
            {/* Day header */}
            <div className="flex border-b border-border" style={{ height: 20 }}>
              {Array.from({ length: totalDays }).map((_, i) => {
                const d = addDays(rangeStart, i);
                const isToday = i === todayOffset;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={i}
                    style={{ width: DAY_WIDTH }}
                    className={cn(
                      "shrink-0 border-r border-border/50 text-center text-[9.5px] leading-5",
                      isWeekend && "bg-surface-muted/40",
                      isToday ? "font-semibold text-primary" : "text-muted-foreground",
                    )}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Today marker */}
            {todayOffset >= 0 && todayOffset < totalDays && (
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/60"
                style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
              />
            )}

            {/* Rows */}
            {rows.map(({ task }) => {
              const start = toDate(task.startDate);
              const due = toDate(task.dueDate);
              return (
                <div key={task.id} style={{ height: ROW_HEIGHT }} className="relative border-b border-border">
                  {start && due ? (
                    <button
                      onClick={() => onOpen(task)}
                      title={task.title}
                      style={{
                        left: daysBetween(rangeStart, start) * DAY_WIDTH,
                        width: Math.max(1, daysBetween(start, due) + 1) * DAY_WIDTH - 4,
                        top: ROW_HEIGHT / 2 - 9,
                      }}
                      className={cn(
                        "absolute h-[18px] truncate rounded-md px-2 text-left text-[10.5px] font-medium text-white shadow-xs",
                        BAR_COLOR[task.status],
                      )}
                    >
                      {task.title}
                    </button>
                  ) : due ? (
                    <button
                      onClick={() => onOpen(task)}
                      title={`${task.title} — due ${due.toLocaleDateString("en-IN")}`}
                      style={{
                        left: daysBetween(rangeStart, due) * DAY_WIDTH + DAY_WIDTH / 2 - 6,
                        top: ROW_HEIGHT / 2 - 6,
                      }}
                      className={cn(
                        "absolute h-3 w-3 rotate-45",
                        task.type === "milestone" ? "bg-warning" : BAR_COLOR[task.status],
                      )}
                    />
                  ) : null}
                </div>
              );
            })}

            {/* Dependency arrows ("blocks" relations) */}
            {arrows.length > 0 && (
              <svg
                className="pointer-events-none absolute left-0 top-0"
                width={totalWidth}
                height={HEADER_HEIGHT + rows.length * ROW_HEIGHT}
              >
                <defs>
                  <marker id="gantt-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" />
                  </marker>
                </defs>
                {arrows.map((a, i) => {
                  const path = `M ${a.from.right} ${a.from.y} C ${a.from.right + 16} ${a.from.y}, ${a.to.left - 16} ${a.to.y}, ${a.to.left - 6} ${a.to.y}`;
                  return (
                    <path
                      key={i}
                      d={path}
                      fill="none"
                      className="stroke-muted-foreground/60"
                      strokeWidth={1.5}
                      markerEnd="url(#gantt-arrowhead)"
                    />
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
