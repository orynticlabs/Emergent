/**
 * Generic, provider-agnostic AI types — Step 4. Nothing in this file (or
 * anywhere under orycms/ai) knows about Gemini, WhatsApp, or any other
 * concrete provider/channel. A provider module (orycms/gemini today; a
 * future orycms/openai or orycms/claude) is what maps its own API's
 * request/response shape onto these types — see providers/gemini.provider.ts
 * for the one concrete example that exists right now.
 */

/**
 * Identifies which provider produced/should produce a result. A plain
 * string union rather than importing each provider's own id constant, so
 * this file never needs to import a provider module to stay in sync.
 */
export type OryCMSAIProviderId = "gemini";

export interface OryCMSAIGenerateRequest {
  /** Optional system-level instruction (persona, constraints, tone). Not stored, not logged. When omitted, a provider may fall back to its own saved default (see providers/gemini.provider.ts). */
  systemInstruction?: string | null;
  /**
   * Extra instruction ADDED ON TOP of the effective systemInstruction
   * (explicit or provider-default) rather than replacing it — e.g. a
   * WhatsApp menu option's per-option AI Instructions, combined with a
   * saved base instruction instead of overriding it. Not stored, not
   * logged. Omit when there's nothing to add.
   */
  additionalInstructions?: string | null;
  /** The user-facing message/prompt to generate a response to. Not stored, not logged. */
  userMessage: string;
}

export interface OryCMSAIUsage {
  promptTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

/**
 * Normalized result every provider's generate() call resolves to —
 * success/failure, which provider and model produced it, the generated
 * text, and usage metadata "if safely available" (providers that don't
 * report usage return null rather than guessing). Never contains an API
 * key or any other credential. A provider's generate() must never throw —
 * every failure path (not configured, invalid request, upstream API error)
 * comes back as `{ success: false, error }` instead, so callers never need
 * a try/catch around a generate() call.
 */
export type OryCMSAIGenerateResult =
  | {
      success: true;
      provider: OryCMSAIProviderId;
      model: string;
      text: string;
      usage: OryCMSAIUsage | null;
      error: null;
    }
  | {
      success: false;
      provider: OryCMSAIProviderId;
      model: string | null;
      text: null;
      usage: null;
      error: { code: string; message: string };
    };
