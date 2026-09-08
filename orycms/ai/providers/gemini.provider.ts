import { OryCMSGeminiService } from "@/gemini";
import type { OryCMSAIProvider } from "../ai.provider";
import type { OryCMSAIGenerateRequest, OryCMSAIGenerateResult } from "../ai.types";

/**
 * Adapter that makes the Gemini plugin (orycms/gemini) satisfy the generic
 * OryCMSAIProvider contract. This is the ONLY file that depends on both
 * orycms/ai and orycms/gemini - orycms/ai's core types/interface
 * (ai.types.ts, ai.provider.ts) never import from orycms/gemini, and
 * orycms/gemini never imports from orycms/ai (see gemini.types.ts's header
 * comment). That one-way dependency here is what keeps adding a second
 * provider (e.g. orycms/openai) from requiring any change to this file or
 * to orycms/gemini.
 *
 * gemini.service.ts's generateContent() already returns a result shaped
 * exactly like OryCMSAIGenerateResult (success/provider/model/text/usage/
 * error - see gemini.types.ts's OryCMSGeminiGenerateResult), so this
 * adapter is a thin pass-through rather than a field-by-field mapping. It
 * stays a named function (not just a re-export) so the seam is visible in
 * code, and so a future provider whose native shape doesn't line up as
 * neatly has an obvious place to add real normalization.
 */
export const geminiAIProvider: OryCMSAIProvider = {
  id: "gemini",

  async isConfigured(): Promise<boolean> {
    const settings = await OryCMSGeminiService.getSettings();
    return Boolean(settings?.apiKeyConfigured);
  },

  async isAutoReplyEnabled(): Promise<boolean> {
    const settings = await OryCMSGeminiService.getSettings();
    return Boolean(settings?.autoReplyEnabled);
  },

  async generate(request: OryCMSAIGenerateRequest): Promise<OryCMSAIGenerateResult> {
    return OryCMSGeminiService.generateContent({
      systemInstruction: request.systemInstruction ?? null,
      additionalInstructions: request.additionalInstructions ?? null,
      userMessage: request.userMessage,
    });
  },
};
