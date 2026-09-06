import type { OryCMSAIProvider } from "./ai.provider";
import type { OryCMSAIGenerateRequest, OryCMSAIGenerateResult, OryCMSAIProviderId } from "./ai.types";
import { geminiAIProvider } from "./providers/gemini.provider";

/**
 * Registry of every AI provider adapter currently available. This is the
 * one place in the generic layer that references a concrete provider
 * module (via providers/gemini.provider.ts) — adding a second provider
 * later means adding one line here and one new providers/*.provider.ts
 * file, nothing else in orycms/ai changes.
 */
const PROVIDERS: Record<OryCMSAIProviderId, OryCMSAIProvider> = {
  gemini: geminiAIProvider,
};

/** Only one provider exists right now, so it's also the default — callers that don't care which provider answers can omit the parameter entirely. */
const DEFAULT_PROVIDER_ID: OryCMSAIProviderId = "gemini";

function unknownProviderResult(providerId: OryCMSAIProviderId): OryCMSAIGenerateResult {
  return {
    success: false,
    provider: providerId,
    model: null,
    text: null,
    usage: null,
    error: { code: "AI_PROVIDER_NOT_FOUND", message: `No AI provider registered for "${providerId}".` },
  };
}

/**
 * The generic entry point every caller (this step's test route, and any
 * future module that wants AI — none of which exist yet) should use
 * instead of importing a provider module directly. Never depends on
 * WhatsApp, and never throws — see OryCMSAIProvider.generate()'s contract.
 */
export const OryCMSAIService = {
  async generate(
    request: OryCMSAIGenerateRequest,
    providerId: OryCMSAIProviderId = DEFAULT_PROVIDER_ID,
  ): Promise<OryCMSAIGenerateResult> {
    const provider = PROVIDERS[providerId];
    if (!provider) return unknownProviderResult(providerId);
    return provider.generate(request);
  },

  /** True once the given provider (default: gemini) has enough configuration to attempt generation. */
  async isConfigured(providerId: OryCMSAIProviderId = DEFAULT_PROVIDER_ID): Promise<boolean> {
    const provider = PROVIDERS[providerId];
    return provider ? provider.isConfigured() : false;
  },

  /** True when the given provider's (default: gemini) saved configuration has automated replies turned on. A caller (e.g. a WhatsApp automation service) should check this — and isConfigured() — before calling generate() on a customer's behalf. */
  async isAutoReplyEnabled(providerId: OryCMSAIProviderId = DEFAULT_PROVIDER_ID): Promise<boolean> {
    const provider = PROVIDERS[providerId];
    return provider ? provider.isAutoReplyEnabled() : false;
  },

  /** Ids of every provider currently registered — for a future "choose a provider" UI. */
  listProviderIds(): OryCMSAIProviderId[] {
    return Object.keys(PROVIDERS) as OryCMSAIProviderId[];
  },
};
