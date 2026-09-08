import type { OryCMSAIGenerateRequest, OryCMSAIGenerateResult, OryCMSAIProviderId } from "./ai.types";

/**
 * The contract every AI provider adapter implements - this is the entire
 * generic layer's surface area. orycms/ai/ai.service.ts (the orchestrator)
 * and any future caller (a WhatsApp AI-reply feature, some other module)
 * only ever talk to this interface, never to a concrete provider's own
 * types or client directly.
 */
export interface OryCMSAIProvider {
  /** Stable identifier for this provider - must match one of the values in OryCMSAIProviderId. */
  readonly id: OryCMSAIProviderId;

  /** True once this provider has enough configuration (e.g. an API key) to attempt generation. Does not make a network call - see generate()'s own "not configured" failure for that distinction, and the provider's own Test Connection for an actual live check. */
  isConfigured(): Promise<boolean>;

  /**
   * True when this provider's saved configuration has automated replies
   * turned on (e.g. Gemini's `autoReplyEnabled` - see
   * providers/gemini.provider.ts). A separate gate from isConfigured():
   * a provider can be fully configured (valid API key) while automation
   * is still deliberately switched off, and vice versa is meaningless (an
   * unconfigured provider is never "enabled" for automation). Added for a
   * future automated-reply caller (a WhatsApp automation service, not
   * built by orycms/ai itself) to check before calling generate() on a
   * customer's behalf, so that concept stays out of the generic
   * generate() contract itself.
   */
  isAutoReplyEnabled(): Promise<boolean>;

  /**
   * Generates a response for the given request using this provider's
   * currently configured model/temperature/max-output-tokens. Never
   * throws - every failure resolves to `{ success: false, error }`.
   */
  generate(request: OryCMSAIGenerateRequest): Promise<OryCMSAIGenerateResult>;
}
