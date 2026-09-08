/**
 * Structured, colored terminal logging for operationally-interesting
 * events (WhatsApp webhook lifecycle, AI generation, outbound sends,
 * connection checks) - server-side stdout only, not a UI or a DB table.
 *
 * Deliberately still bound by the same rule every WhatsApp/Gemini module
 * in this codebase already follows: never log API keys, access tokens,
 * verify tokens, app secrets, full customer phone numbers, message text,
 * system instructions, or generated replies. This module's functions only
 * accept pre-sanitized primitives (booleans, numbers, short status
 * strings) for exactly that reason - there's no `data: unknown` escape
 * hatch that could be handed a raw settings object or message body by
 * accident. `maskPhone`/`maskId` are the only way a customer-identifying
 * value is allowed through, and both truncate to a non-identifying
 * fragment.
 *
 * Plain ANSI escape codes, no dependency - mirrors this codebase's general
 * "plain fetch, no SDK" preference (see payments/razorpay.client.ts).
 * Colors are skipped automatically when stdout isn't a TTY (e.g. piped to
 * a log file/aggregator in production) so output stays greppable there.
 */

const isTTY = typeof process !== "undefined" && Boolean(process.stdout?.isTTY);

const CODES = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
} as const;

function paint(text: string, ...codes: (keyof typeof CODES)[]): string {
  if (!isTTY) return text;
  return codes.map((c) => CODES[c]).join("") + text + CODES.reset;
}

function timestamp(): string {
  return new Date().toISOString().split("T")[1]!.replace("Z", "");
}

/** "919893741437" → "***…1437" - enough to tell two conversations apart in a log stream without printing a full, dialable phone number. */
export function maskPhone(value: string): string {
  if (value.length <= 4) return "***";
  return `***…${value.slice(-4)}`;
}

/** Same idea for provider message ids (Meta's wamid.* strings are long and not sensitive, but not worth printing in full either). */
export function maskId(value: string): string {
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export type OryCMSLogOutcome = "ok" | "fail" | "warn" | "pending" | "info";

const OUTCOME_STYLE: Record<OryCMSLogOutcome, { icon: string; color: keyof typeof CODES }> = {
  ok: { icon: "✓", color: "green" },
  fail: { icon: "✗", color: "red" },
  warn: { icon: "!", color: "yellow" },
  pending: { icon: "…", color: "cyan" },
  info: { icon: "·", color: "gray" },
};

/** Opens a titled block - one per webhook delivery / connection check, so concurrent requests' logs don't visually interleave into nonsense. */
export function logSection(title: string): void {
  const line = paint("─".repeat(50), "gray");
  console.log(`\n${line}`);
  console.log(`${paint(timestamp(), "dim")}  ${paint(title, "bold", "cyan")}`);
}

/** One line within the current section - the actual "connection connected / step ok / step failed" output. `detail` must already be a safe-to-print string (masked/redacted by the caller if it touches customer data). */
export function logStep(outcome: OryCMSLogOutcome, message: string, detail?: string): void {
  const style = OUTCOME_STYLE[outcome];
  const icon = paint(style.icon, style.color, "bold");
  const text = detail ? `${message} ${paint(detail, "dim")}` : message;
  console.log(`  ${icon} ${text}`);
}

export function logSectionEnd(): void {
  console.log(paint("─".repeat(50), "gray"));
}
