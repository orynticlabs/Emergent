"use client";

import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/**
 * Modern luxury dark glass toast matching the site's aesthetic:
 * - Ultra-dark frosted glass card (#0f0f14 with backdrop-blur-2xl)
 * - Subtle border with top highlight border
 * - Status-based accent glow (brand orange for success, crimson for error, blue for info)
 * - Clean icon badge + typography
 * - Smooth dismiss button
 */
export function siteAlertToast({
  title,
  description,
  variant = "success",
  duration = 5000,
}) {
  const isError = variant === "error";
  const isInfo = variant === "info";

  const Icon = isError ? AlertCircle : isInfo ? Info : CheckCircle2;

  const accentColor = isError
    ? "text-red-400"
    : isInfo
      ? "text-brand-blue"
      : "text-brand-orange";

  const iconBg = isError
    ? "bg-red-500/15 border-red-500/20 text-red-400"
    : isInfo
      ? "bg-brand-blue/15 border-brand-blue/20 text-brand-blue"
      : "bg-brand-orange/15 border-brand-orange/20 text-brand-orange";

  const glowGradient = isError
    ? "from-red-500/20 via-transparent to-transparent"
    : isInfo
      ? "from-brand-blue/20 via-transparent to-transparent"
      : "from-brand-orange/25 via-transparent to-transparent";

  const topBorderColor = isError
    ? "via-red-500/60"
    : isInfo
      ? "via-brand-blue/60"
      : "via-brand-orange/70";

  return toast.custom(
    (id) => (
      <div
        role="alert"
        className="group relative flex w-[min(94vw,25rem)] items-start gap-3.5 overflow-hidden rounded-2xl border border-white/12 bg-[#0d0d12]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 hover:border-white/20"
      >
        {/* Subtle accent glow behind the card */}
        <div
          className={`pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${glowGradient} blur-2xl`}
          aria-hidden="true"
        />

        {/* Top gradient highlight line */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${topBorderColor} to-transparent`}
          aria-hidden="true"
        />

        {/* Status Icon Badge */}
        <div
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconBg} shadow-sm`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="relative flex-1 min-w-0 pt-0.5">
          <h5 className="text-sm font-semibold tracking-tight text-white">
            {title}
          </h5>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              {description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => toast.dismiss(id)}
          className="relative -mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration }
  );
}
