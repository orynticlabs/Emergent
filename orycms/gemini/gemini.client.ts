/**
 * Thin wrapper over the Gemini (Generative Language) API — plain `fetch`,
 * no SDK dependency, mirroring payments/razorpay.client.ts. Covers Test
 * Connection (a lightweight "does this key + model actually work" check)
 * and, as of Step 4, real content generation via generateContent.
 *
 * The API key is passed in as a parameter (already decrypted by
 * gemini.service.ts) rather than read from an env var like Razorpay's
 * client does, because it is admin-configured, per-workspace state stored
 * in orycms_gemini_settings, not a deployment-level secret.
 */

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
 * metadata read — it does not consume generation quota and sends no
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

  if (!res.ok) {
    return {
      ok: false,
      code: "GEMINI_REQUEST_FAILED",
      message: `Gemini API returned an unexpected error (HTTP ${res.status}).`,
    };
  }

  return {
    ok: true,
    code: "GEMINI_CONNECTED",
    message: `Connected — "${model}" is reachable with this API key.`,
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

/**
 * Calls POST /v1beta/models/{model}:generateContent with the API key in the
 * `x-goog-api-key` header (never a query string — same reasoning as
 * testOryCMSGeminiConnection above). Never logs the API key, the system
 * instruction, the user message, or the generated text — the caller
 * (gemini.service.ts) owns what, if anything, gets logged, and Step 4's
 * instructions are "don't log prompts unnecessarily," so this function logs
 * nothing at all.
 */
export async function generateOryCMSGeminiContent(
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
