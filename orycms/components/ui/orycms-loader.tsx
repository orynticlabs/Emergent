import { cn } from "@/lib/utils";

/**
 * OryCMS's branded spinner - a drop-in replacement for lucide's `Loader2`.
 * Sizing/color are controlled the same way (pass `h-x w-x text-*` in className);
 * `animate-spin` is baked in so callers don't need to add it.
 */
export function OryCMSSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4 w-4 animate-spin text-primary", className)}
      role="status"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
