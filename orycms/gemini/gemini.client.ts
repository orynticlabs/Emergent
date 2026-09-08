/**
 * Thin wrapper over the Gemini (Generative Language) API - plain `fetch`,
 * no SDK dependency, mirroring payments/razorpay.client.ts. Covers Test
 * Connection (a lightweight "does this key + model actually work" check)
 * and, as of Step 4, real content generation via generateContent.
 *
 * The API key is passed in as a parameter (already decrypted by
 * gemini.service.ts) rather than read from an env var like Razorpay's
 * client does, because it is admin-configured, per-workspace state stored
 * in orycms_gemini_settings, not a deployment-level secret.
 */

import { logStep } from "@/lib/pretty-log";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface OryCMSGeminiConnectionCheck {
  ok: boolean;
  code: string;
  message: string;
}

/**
 * Calls GET /v1beta/models/{model} with the API key in the
 * `x-goog-api-key` header (never a query string, so it can't end up in
 * server/proxy access logs the way a `?key=` query param can). This is a
 * metadata read - it does not consume generation quota and sends no
 * prompt/content. Never logs the API key; the key only ever appears in the
 * outgoing header, never in a thrown error or returned message.
 */
export async function testOryCMSGeminiConnection(
  apiKey: string,
  model: string,
): Promise<OryCMSGeminiConnectionCheck> {
  let res: Response;
  try {
    res = await fetch(`${GEMINI_API_BASE}/models/${encodeURIComponent(model)}`, {
      method: "GET",
      headers: { "x-goog-api-key": apiKey },
    });
  } catch {
    logStep("fail", "Gemini connect", `${model} · network unreachable`);
    return {
      ok: false,
      code: "GEMINI_NETWORK_ERROR",
      message: "Couldn't reach the Gemini API. Check network connectivity and try again.",
    };
  }

  if (res.status === 401 || res.status === 403) {
    logStep("fail", "Gemini connect", `${model} · HTTP ${res.status} invalid key`);
    return {
      ok: false,
      code: "GEMINI_INVALID_API_KEY",
      message: "Gemini rejected the API key. Check that it's correct and still active.",
    };
  }

  if (res.status === 404) {
    logStep("fail", "Gemini connect", `${model} · model not found`);
    return {
      ok: false,
      code: "GEMINI_MODEL_NOT_FOUND",
      message: `Model "${model}" was not found or isn't available to this API key.`,
    };
  }

  if (!res.ok) {
    logStep("fail", "Gemini connect", `${model} · HTTP ${res.status}`);
    return {
      ok: false,
      code: "GEMINI_REQUEST_FAILED",
      message: `Gemini API returned an unexpected error (HTTP ${res.status}).`,
    };
  }

  logStep("ok", "Gemini connect", model);
  return {
    ok: true,
    code: "GEMINI_CONNECTED",
    message: `Connected - "${model}" is reachable with this API key.`,
  };
}

// ── Generation ─────────────────────────────────────────────────────────────────

export interface OryCMSGeminiGenerateOptions {
  systemInstruction?: string | null;
  userMessage: string;
  temperature: number;
  maxOutputTokens: number;
}

export interface OryCMSGeminiUsage {
  promptTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

export type OryCMSGeminiGenerateResult =
  | { ok: true; text: string; usage: OryCMSGeminiUsage | null }
  | { ok: false; code: string; message: string };

// Google's free-tier capacity for popular models (e.g. "gemini-flash-latest")
// measurably 503s a meaningful fraction of the time under load - observed
// directly: 4 of 6 back-to-back real calls failed with 503 in testing. A
// 503 is Google's own server saying "temporarily overloaded," not a config
// or request problem, and empirically clears within a second or two - so a
// couple of short, bounded retries meaningfully improves real delivery odds
// for the WhatsApp auto-reply flow without risking a long hang (worst case:
// ~1.5s of extra latency, still well inside what the webhook route/Meta's
// own retry tolerance can absorb). Deliberately NOT retried: 429 (rate
// limit) - Google's own 429s here have included a hard `limit: 0`
// zero-quota case that no amount of retrying fixes, and its suggested
// retry-after (20s+) doesn't fit inside a single webhook request anyway.
const TRANSIENT_RETRY_STATUSES = new Set([503]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls POST /v1beta/models/{model}:generateContent with the API key in the
 * `x-goog-api-key` header (never a query string - same reasoning as
 * testOryCMSGeminiConnection above). Never logs the API key, the system
 * instruction, the user message, or the generated text - the caller
 * (gemini.service.ts) owns what, if anything, gets logged, and Step 4's
 * instructions are "don't log prompts unnecessarily," so this function logs
 * nothing at all. Retries automatically (see TRANSIENT_RETRY_STATUSES above)
 * on Gemini's own transient 503s before giving up.
 */
export async function generateOryCMSGeminiContent(
  apiKey: string,
  model: string,
  options: OryCMSGeminiGenerateOptions,
): Promise<OryCMSGeminiGenerateResult> {
  let lastResult: OryCMSGeminiGenerateResult = {
    ok: false,
    code: "GEMINI_REQUEST_FAILED",
    message: "Gemini API returned an unexpected error.",
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    lastResult = await attemptGenerateOryCMSGeminiContent(apiKey, model, options);
    if (lastResult.ok) {
      const usage = lastResult.usage;
      const usageLabel = usage?.totalTokens != null ? `${usage.totalTokens} tokens` : undefined;
      logStep("ok", `Gemini generate (attempt ${attempt}/${MAX_ATTEMPTS})`, usageLabel);
      return lastResult;
    }

    const status = lastResult.code === "GEMINI_REQUEST_FAILED" ? extractHttpStatus(lastResult.message) : null;
    const shouldRetry = status !== null && TRANSIENT_RETRY_STATUSES.has(status) && attempt < MAX_ATTEMPTS;
    if (!shouldRetry) {
      logStep("fail", `Gemini generate (attempt ${attempt}/${MAX_ATTEMPTS})`, lastResult.code);
      return lastResult;
    }

    logStep("warn", `Gemini generate (attempt ${attempt}/${MAX_ATTEMPTS})`, `HTTP ${status} · retrying`);
    await delay(RETRY_DELAY_MS * attempt);
  }

  return lastResult;
}

/** Pulls the HTTP status back out of "Gemini API returned an unexpected error (HTTP 503)." - avoids restructuring attemptGenerateOryCMSGeminiContent's return shape just to carry the status code an extra hop. */
function extractHttpStatus(message: string): number | null {
  const match = /HTTP (\d+)/.exec(message);
  return match ? Number(match[1]) : null;
}

async function attemptGenerateOryCMSGeminiContent(
  apiKey: string,
  model: string,
  options: OryCMSGeminiGenerateOptions,
): Promise<OryCMSGeminiGenerateResult> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: options.userMessage }] }],
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
    },
  };
  if (options.systemInstruction?.trim()) {
    body.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  let res: Response;
  try {
    res = await fetch(`${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      code: "GEMINI_NETWORK_ERROR",
      message: "Couldn't reach the Gemini API. Check network connectivity and try again.",
    };
  }

  if (res.status === 401 || res.status === 403) {
    return {
      ok: false,
      code: "GEMINI_INVALID_API_KEY",
      message: "Gemini rejected the API key. Check that it's correct and still active.",
    };
  }

  if (res.status === 404) {
    return {
      ok: false,
      code: "GEMINI_MODEL_NOT_FOUND",
      message: `Model "${model}" was not found or isn't available to this API key.`,
    };
  }

  if (res.status === 400) {
    return {
      ok: false,
      code: "GEMINI_INVALID_REQUEST",
      message: "Gemini rejected the request (invalid model, temperature, or token limit).",
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      code: "GEMINI_RATE_LIMITED",
      message: "Gemini rate-limited this request. Try again shortly.",
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      code: "GEMINI_REQUEST_FAILED",
      message: `Gemini API returned an unexpected error (HTTP ${res.status}).`,
    };
  }

  type GeminiGenerateResponse = {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
    }[];
    promptFeedback?: { blockReason?: string };
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };

  const data = (await res.json().catch(() => null)) as GeminiGenerateResponse | null;
  if (!data) {
    return {
      ok: false,
      code: "GEMINI_INVALID_RESPONSE",
      message: "Gemini returned a response that couldn't be parsed.",
    };
  }

  if (data.promptFeedback?.blockReason) {
    return {
      ok: false,
      code: "GEMINI_BLOCKED",
      message: `Gemini blocked this request (${data.promptFeedback.blockReason}).`,
    };
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) {
    return {
      ok: false,
      code: "GEMINI_NO_CONTENT",
      message: "Gemini returned no generated content.",
    };
  }

  const usageMetadata = data.usageMetadata;
  const usage: OryCMSGeminiUsage | null = usageMetadata
    ? {
        promptTokens: usageMetadata.promptTokenCount ?? null,
        outputTokens: usageMetadata.candidatesTokenCount ?? null,
        totalTokens: usageMetadata.totalTokenCount ?? null,
      }
    : null;

  return { ok: true, text, usage };
}
