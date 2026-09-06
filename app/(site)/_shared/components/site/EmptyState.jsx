"use client";

import { Reveal, ArrowLink } from "@site/components/site/Reveal";

/**
 * Shared empty-state block for API-driven or filterable content on the marketing site —
 * e.g. a portfolio filter with no matches. Keep this brand-consistent instead of a bare
 * "no results" string; wire it wherever a list/grid can legitimately render zero items
 * while the surrounding section still needs to stay visible.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionHref,
  onAction,
  className = "",
  testId,
}) {
  return (
    <Reveal>
      <div
        data-testid={testId}
        className={`flex flex-col items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center ${className}`}
      >
        {Icon && (
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-6 w-6 text-brand-orange" strokeWidth={1.75} aria-hidden="true" />
          </div>
        )}
        <p className={`font-display text-xl font-bold ${Icon ? "mt-6" : ""}`}>{title}</p>
        {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">{description}</p>}
        {action && actionHref && (
          <div className="mt-7">
            <ArrowLink to={actionHref} variant="ghost">
              {action}
            </ArrowLink>
          </div>
        )}
        {action && onAction && !actionHref && (
          <button
            type="button"
            onClick={onAction}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:border-brand-orange hover:text-brand-orange"
          >
            {action}
          </button>
        )}
      </div>
    </Reveal>
  );
}
