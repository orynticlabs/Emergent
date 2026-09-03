import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AnimationEvent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Browser autofill sets an input's DOM value directly, without firing the
 * "input" event React listens to for controlled components — so state
 * (email/password, etc.) stays stale even though the field visually shows a
 * value, which can leave a `disabled={!value}` submit button stuck forever.
 * Pair with the `onAutoFillStart` keyframe in styles.css (fires only on
 * `:-webkit-autofill`) via `<input onAnimationStart={onAutofillSync(setEmail)} />`
 * to resync state the moment autofill happens.
 */
export function onAutofillSync(setValue: (value: string) => void) {
  return (event: AnimationEvent<HTMLInputElement>) => {
    if (event.animationName === "onAutoFillStart") {
      setValue(event.currentTarget.value);
    }
  };
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  return inrFormatter.format(value);
}

export function formatCompactCurrency(value: number) {
  if (value >= 100000) {
    return `${formatCurrency(value / 100000)}L`;
  }

  if (value >= 1000) {
    return `${formatCurrency(value / 1000)}k`;
  }

  return formatCurrency(value);
}

/**
 * Default per-account avatar — a memoji-style cartoon face, deterministically
 * generated from `seed` (pass the user's id, not their name/email, so the
 * avatar doesn't change if they're renamed). Same seed always renders the
 * same face; different accounts get visibly different ones. Backed by
 * DiceBear's free avatar API — no account data leaves the browser beyond the
 * seed string itself.
 */
export function oryCMSAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
