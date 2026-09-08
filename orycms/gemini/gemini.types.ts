/**
 * Gemini AI plugin types - Step 3. Configuration + connection test only.
 * Deliberately not wired to WhatsApp or anything else: every other OryCMS
 * module that wants AI talks to this module through OryCMSGeminiService,
 * never to a WhatsApp-specific concept, so a second provider (OpenAI,
 * Claude, ...) can be added later as its own sibling module without
 * touching this one or WhatsApp.
 */

// ── Models ─────────────────────────────────────────────────────────────────────

/**
 * Known Gemini model ids offered in the UI's selector. Not enforced by a DB
 * CHECK constraint (unlike whatsapp's provider column) - Google adds/retires
 * model ids on its own schedule, so the column stays a free-text TEXT and
 * this list is only a convenience default set for the dropdown.
 *
 * Deliberately ONLY Google's own stable "-latest" aliases, which always
 * resolve to Google's current recommended model in that tier. Dated model
 * ids (e.g. "gemini-2.5-flash") were removed after being proven, against a
 * real API key, to fail generateContent with a 404 - Google's own error
 * for those was: "This model ... is no longer available to new users."
 * The model still exists (GET /v1beta/models/{id} succeeds, so it's not
 * even "not found" in the usual sense) but real newer API keys are blocked
 * from generation on it - the exact failure mode a hardcoded dated id in
 * this list is guaranteed to hit again as Google keeps advancing "latest."
 */
export const ORYCMS_GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-flash-lite-latest",
] as const;

export const ORYCMS_GEMINI_DEFAULT_MODEL: (typeof ORYCMS_GEMINI_MODELS)[number] =
  "gemini-flash-latest";

export const ORYCMS_GEMINI_DEFAULT_TEMPERATURE = 0.7;
export const ORYCMS_GEMINI_DEFAULT_MAX_OUTPUT_TOKENS = 2048;

// Generous but sane bounds - Gemini's own API rejects out-of-range values
// too, this is just a fast client/server-side check before the network call.
export const ORYCMS_GEMINI_TEMPERATURE_MIN = 0;
export const ORYCMS_GEMINI_TEMPERATURE_MAX = 2;
export const ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MIN = 1;
export const ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MAX = 8192;

// Soft caps on the free-text instruction fields - generous, just cheap
// guardrails against an accidentally pasted multi-megabyte document (every
// character here is re-sent on every future generation call, so unbounded
// size is also a cost/latency footgun, not just a storage one).
export const ORYCMS_GEMINI_SYSTEM_INSTRUCTION_MAX_LENGTH = 8000;
export const ORYCMS_GEMINI_BUSINESS_CONTEXT_MAX_LENGTH = 4000;

// ── Persisted record ──────────────────────────────────────────────────────────

/**
 * Row shape as stored in orycms_gemini_settings. "apiKey" holds the
 * AES-256-GCM ciphertext blob (see gemini.crypto.ts), never plaintext -
 * callers that read through gemini.repo.ts directly get this raw,
 * still-encrypted value; gemini.service.ts is what decrypts it, and only
 * when explicitly asked to (the connection test).
 */
export interface OryCMSGeminiSettingsRecord {
  id: string;
  enabled: boolean;
  apiKey: string | null;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  /** Business-defined instructions for how the AI should behave. Plain text, not encrypted - see this field's header note in gemini.schema.ts for why. */
  systemInstruction: string | null;
  /** Free-text business context/description (products, tone, policies) an admin can optionally record alongside systemInstruction. Not injected into generation automatically in this step - purely stored/informational. */
  businessContext: string | null;
  /** Gate for a future automated-reply feature (e.g. WhatsApp) to check before acting - this module does not act on it itself. */
  autoReplyEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response-safe projection: never carries the API key, encrypted or not -
 * only whether one has been configured. This is the only shape the
 * settings API route may return.
 */
export type OryCMSGeminiSettingsSafe = Omit<OryCMSGeminiSettingsRecord, "apiKey"> & {
  apiKeyConfigured: boolean;
  /** True once an API key is configured - a live connection still needs Test Connection to confirm it actually works. */
  connected: boolean;
};

// ── Write inputs ───────────────────────────────────────────────────────────────

/** Input to the service layer - apiKey (if present) is plaintext; the service encrypts it before it ever reaches the repository. */
export interface OryCMSSaveGeminiSettingsInput {
  enabled?: boolean;
  apiKey?: string | null;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string | null;
  businessContext?: string | null;
  autoReplyEnabled?: boolean;
}

export type OryCMSUpdateGeminiSettingsInput = Partial<OryCMSSaveGeminiSettingsInput>;

/**
 * Input to the repository layer - same shape, but apiKey (if present) is
 * already the encrypted blob. The repository never sees plaintext and
 * never performs encryption itself.
 */
export interface OryCMSGeminiSettingsWriteRecord {
  enabled: boolean;
  apiKey: string | null;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemInstruction: string | null;
  businessContext: string | null;
  autoReplyEnabled: boolean;
}

export type OryCMSGeminiSettingsPatch = Partial<OryCMSGeminiSettingsWriteRecord>;

// ── Connection test ────────────────────────────────────────────────────────────

export interface OryCMSGeminiTestConnectionResult {
  ok: boolean;
  code: string;
  message: string;
}

// ── Generation ─────────────────────────────────────────────────────────────────

/** Stable id for this provider, reused by orycms/ai's provider registry - kept here (not in orycms/ai) so this module has no dependency on orycms/ai. */
export const ORYCMS_GEMINI_PROVIDER_ID = "gemini" as const;

export interface OryCMSGeminiGenerateRequest {
  /**
   * Per-call override. When omitted (undefined) or null, generateContent()
   * falls back to the saved orycms_gemini_settings.systemInstruction
   * automatically - callers don't have to fetch and pass it themselves. An
   * explicit value here always wins over the stored one.
   */
  systemInstruction?: string | null;
  /**
   * Extra instruction ADDED ON TOP of the effective systemInstruction
   * (whichever of the above/the saved one applies) rather than replacing
   * it - e.g. a WhatsApp menu option's per-option AI Instructions,
   * combined with the saved systemInstruction + businessContext rather
   * than overriding them. Omit when there's nothing to add.
   */
  additionalInstructions?: string | null;
  userMessage: string;
}

export interface OryCMSGeminiUsage {
  promptTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

/**
 * Already shaped like the generic normalized AI result (success/provider/
 * model/text/usage/error) that orycms/ai/ai.types.ts's OryCMSAIGenerateResult
 * describes - defined here, independently, rather than imported from
 * orycms/ai, so orycms/gemini has zero dependency on orycms/ai (the
 * dependency runs the other way: orycms/ai/providers/gemini.provider.ts
 * depends on this module, not vice versa). generateContent() never throws;
 * every failure path (not configured, invalid input, Gemini API error) is
 * returned as `{ success: false, error }` instead.
 */
export type OryCMSGeminiGenerateResult =
  | {
      success: true;
      provider: typeof ORYCMS_GEMINI_PROVIDER_ID;
      model: string;
      text: string;
      usage: OryCMSGeminiUsage | null;
      error: null;
    }
  | {
      success: false;
      provider: typeof ORYCMS_GEMINI_PROVIDER_ID;
      model: string | null;
      text: null;
      usage: null;
      error: { code: string; message: string };
    };
