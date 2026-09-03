import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import {
  deleteOryCMSGeminiSettings,
  getOryCMSGeminiSettings,
  saveOryCMSGeminiSettings,
  updateOryCMSGeminiSettings,
} from "./gemini.repo";
import { decryptOryCMSGeminiApiKey, encryptOryCMSGeminiApiKey } from "./gemini.crypto";
import { generateOryCMSGeminiContent, testOryCMSGeminiConnection } from "./gemini.client";
import {
  ORYCMS_GEMINI_BUSINESS_CONTEXT_MAX_LENGTH,
  ORYCMS_GEMINI_DEFAULT_MAX_OUTPUT_TOKENS,
  ORYCMS_GEMINI_DEFAULT_MODEL,
  ORYCMS_GEMINI_DEFAULT_TEMPERATURE,
  ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MAX,
  ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MIN,
  ORYCMS_GEMINI_PROVIDER_ID,
  ORYCMS_GEMINI_SYSTEM_INSTRUCTION_MAX_LENGTH,
  ORYCMS_GEMINI_TEMPERATURE_MAX,
  ORYCMS_GEMINI_TEMPERATURE_MIN,
} from "./gemini.types";
import type {
  OryCMSGeminiGenerateRequest,
  OryCMSGeminiGenerateResult,
  OryCMSGeminiSettingsRecord,
  OryCMSGeminiSettingsSafe,
  OryCMSGeminiTestConnectionResult,
  OryCMSSaveGeminiSettingsInput,
  OryCMSUpdateGeminiSettingsInput,
} from "./gemini.types";

/**
 * Service layer for the Gemini AI plugin — the only place that touches a
 * plaintext API key. Every method here is what the settings route
 * (app/api/orycms/gemini/settings/route.ts) calls after its own
 * requireOryCMSPermission / guardOryCMS check — the same
 * "permission checks live at the route, not the repository/service" split
 * every other OryCMS module follows. No permission logic is duplicated or
 * hardcoded here.
 *
 * This module never imports from, or is imported by, orycms/whatsapp — the
 * two are independent so a future AI provider (or a future messaging
 * channel) can be added without touching the other.
 */

function assertValidTemperature(value: number): void {
  if (
    typeof value !== "number" ||
    Number.isNaN(value) ||
    value < ORYCMS_GEMINI_TEMPERATURE_MIN ||
    value > ORYCMS_GEMINI_TEMPERATURE_MAX
  ) {
    throw Object.assign(
      new Error(
        `temperature must be a number between ${ORYCMS_GEMINI_TEMPERATURE_MIN} and ${ORYCMS_GEMINI_TEMPERATURE_MAX}.`,
      ),
      { code: "GEMINI_INVALID_TEMPERATURE", statusCode: 422 },
    );
  }
}

function assertValidMaxOutputTokens(value: number): void {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MIN ||
    value > ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MAX
  ) {
    throw Object.assign(
      new Error(
        `maxOutputTokens must be a whole number between ${ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MIN} and ${ORYCMS_GEMINI_MAX_OUTPUT_TOKENS_MAX}.`,
      ),
      { code: "GEMINI_INVALID_MAX_OUTPUT_TOKENS", statusCode: 422 },
    );
  }
}

function assertNonEmptyModel(model: string): void {
  if (!model || !model.trim()) {
    throw Object.assign(new Error("model is required."), {
      code: "GEMINI_INVALID_MODEL",
      statusCode: 422,
    });
  }
}

function assertValidSystemInstruction(value: string): void {
  if (typeof value !== "string") {
    throw Object.assign(new Error("systemInstruction must be a string."), {
      code: "GEMINI_INVALID_SYSTEM_INSTRUCTION",
      statusCode: 422,
    });
  }
  if (value.length > ORYCMS_GEMINI_SYSTEM_INSTRUCTION_MAX_LENGTH) {
    throw Object.assign(
      new Error(
        `systemInstruction must be ${ORYCMS_GEMINI_SYSTEM_INSTRUCTION_MAX_LENGTH} characters or fewer.`,
      ),
      { code: "GEMINI_INVALID_SYSTEM_INSTRUCTION", statusCode: 422 },
    );
  }
}

function assertValidBusinessContext(value: string): void {
  if (typeof value !== "string") {
    throw Object.assign(new Error("businessContext must be a string."), {
      code: "GEMINI_INVALID_BUSINESS_CONTEXT",
      statusCode: 422,
    });
  }
  if (value.length > ORYCMS_GEMINI_BUSINESS_CONTEXT_MAX_LENGTH) {
    throw Object.assign(
      new Error(
        `businessContext must be ${ORYCMS_GEMINI_BUSINESS_CONTEXT_MAX_LENGTH} characters or fewer.`,
      ),
      { code: "GEMINI_INVALID_BUSINESS_CONTEXT", statusCode: 422 },
    );
  }
}

/**
 * Combines the saved systemInstruction and businessContext into one string
 * for generateContent()'s automatic fallback (Step 8's "use the saved
 * systemInstruction and businessContext"). Returns null when both are
 * empty, so a caller with neither configured still gets Gemini's own
 * default behavior rather than an empty-but-present instruction string.
 * Never logged — same as the two fields it's built from.
 */
function composeStoredInstruction(
  systemInstruction: string | null,
  businessContext: string | null,
): string | null {
  const parts: string[] = [];
  if (systemInstruction?.trim()) parts.push(systemInstruction.trim());
  if (businessContext?.trim()) parts.push(`Business context:\n${businessContext.trim()}`);
  return parts.length > 0 ? parts.join("\n\n") : null;
}

/**
 * Strips the API key out of a full record, replacing it with a boolean so
 * callers can render "configured" without ever seeing the value — and adds
 * "connected", true once a key is configured (a strong signal, not a live
 * health check; use testConnection for that).
 */
function toSafe(record: OryCMSGeminiSettingsRecord): OryCMSGeminiSettingsSafe {
  const { apiKey, ...rest } = record;
  return { ...rest, apiKeyConfigured: Boolean(apiKey), connected: Boolean(apiKey) };
}

export const OryCMSGeminiService = {
  /** Response-safe settings — never includes the API key, encrypted or not. */
  async getSettings(pool: Pool = getOryCMSPool()): Promise<OryCMSGeminiSettingsSafe | null> {
    const record = await getOryCMSGeminiSettings(pool);
    return record ? toSafe(record) : null;
  },

  /** Creates the settings row if none exists, or fully replaces it. Encrypts apiKey before it ever reaches the repository. */
  async saveSettings(
    input: OryCMSSaveGeminiSettingsInput,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSGeminiSettingsSafe> {
    const model = input.model ?? ORYCMS_GEMINI_DEFAULT_MODEL;
    const temperature = input.temperature ?? ORYCMS_GEMINI_DEFAULT_TEMPERATURE;
    const maxOutputTokens = input.maxOutputTokens ?? ORYCMS_GEMINI_DEFAULT_MAX_OUTPUT_TOKENS;
    const systemInstruction = input.systemInstruction ?? null;
    const businessContext = input.businessContext ?? null;

    assertNonEmptyModel(model);
    assertValidTemperature(temperature);
    assertValidMaxOutputTokens(maxOutputTokens);
    if (systemInstruction !== null) assertValidSystemInstruction(systemInstruction);
    if (businessContext !== null) assertValidBusinessContext(businessContext);

    const record = await saveOryCMSGeminiSettings(
      {
        enabled: input.enabled ?? false,
        apiKey: input.apiKey ? encryptOryCMSGeminiApiKey(input.apiKey) : null,
        model,
        temperature,
        maxOutputTokens,
        systemInstruction,
        businessContext,
        autoReplyEnabled: input.autoReplyEnabled ?? false,
      },
      pool,
    );
    return toSafe(record);
  },

  /**
   * Partial update of the existing settings row. Encrypts apiKey only when
   * the caller actually supplied a new value for it — fields left out of
   * `patch` are untouched, so an already-stored key is never overwritten by
   * omission. Callers (the PATCH route) are responsible for not putting a
   * blank/empty value into `patch.apiKey` when the admin didn't intend to
   * change it.
   */
  async updateSettings(
    patch: OryCMSUpdateGeminiSettingsInput,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSGeminiSettingsSafe> {
    if (patch.model !== undefined) assertNonEmptyModel(patch.model);
    if (patch.temperature !== undefined) assertValidTemperature(patch.temperature);
    if (patch.maxOutputTokens !== undefined) assertValidMaxOutputTokens(patch.maxOutputTokens);
    if (patch.systemInstruction !== undefined && patch.systemInstruction !== null) {
      assertValidSystemInstruction(patch.systemInstruction);
    }
    if (patch.businessContext !== undefined && patch.businessContext !== null) {
      assertValidBusinessContext(patch.businessContext);
    }

    const record = await updateOryCMSGeminiSettings(
      {
        ...(patch.enabled !== undefined && { enabled: patch.enabled }),
        ...(patch.apiKey !== undefined && {
          apiKey: patch.apiKey ? encryptOryCMSGeminiApiKey(patch.apiKey) : null,
        }),
        ...(patch.model !== undefined && { model: patch.model }),
        ...(patch.temperature !== undefined && { temperature: patch.temperature }),
        ...(patch.maxOutputTokens !== undefined && { maxOutputTokens: patch.maxOutputTokens }),
        ...(patch.systemInstruction !== undefined && { systemInstruction: patch.systemInstruction }),
        ...(patch.businessContext !== undefined && { businessContext: patch.businessContext }),
        ...(patch.autoReplyEnabled !== undefined && { autoReplyEnabled: patch.autoReplyEnabled }),
      },
      pool,
    );
    return toSafe(record);
  },

  async deleteSettings(pool: Pool = getOryCMSPool()): Promise<void> {
    await deleteOryCMSGeminiSettings(pool);
  },

  /**
   * Decrypts the stored API key and makes a real, lightweight call to the
   * Gemini API to confirm it (and the configured model) actually work —
   * see gemini.client.ts. No prompt is sent and no content is generated.
   * The decrypted key never leaves this function.
   */
  async testConnection(pool: Pool = getOryCMSPool()): Promise<OryCMSGeminiTestConnectionResult> {
    const record = await getOryCMSGeminiSettings(pool);

    if (!record?.apiKey) {
      return {
        ok: false,
        code: "GEMINI_NOT_CONFIGURED",
        message: "Gemini has not been configured yet — save an API key first.",
      };
    }

    const apiKey = decryptOryCMSGeminiApiKey(record.apiKey);
    return testOryCMSGeminiConnection(apiKey, record.model);
  },

  /**
   * Generates content with the stored API key, model, temperature, and max
   * output tokens. Never throws — every failure (not configured, invalid
   * stored config, invalid request, Gemini API error) comes back as
   * `{ success: false, error }` instead, which is what lets
   * orycms/ai/providers/gemini.provider.ts treat this as a normal result
   * rather than needing a try/catch of its own. Never logs the API key, the
   * system instruction, the user message, or the generated text.
   */
  async generateContent(
    request: OryCMSGeminiGenerateRequest,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSGeminiGenerateResult> {
    const fail = (code: string, message: string, model: string | null = null) =>
      ({
        success: false as const,
        provider: ORYCMS_GEMINI_PROVIDER_ID,
        model,
        text: null,
        usage: null,
        error: { code, message },
      }) satisfies OryCMSGeminiGenerateResult;

    if (!request.userMessage || !request.userMessage.trim()) {
      return fail("GEMINI_INVALID_REQUEST", "userMessage is required.");
    }

    const record = await getOryCMSGeminiSettings(pool);
    if (!record?.apiKey) {
      return fail("GEMINI_NOT_CONFIGURED", "Gemini has not been configured yet — save an API key first.");
    }

    try {
      assertNonEmptyModel(record.model);
      assertValidTemperature(record.temperature);
      assertValidMaxOutputTokens(record.maxOutputTokens);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "GEMINI_INVALID_CONFIGURATION";
      const message = err instanceof Error ? err.message : "Stored Gemini configuration is invalid.";
      return fail(code, message, record.model);
    }

    // Integration point (Step 5, extended in Step 8): an explicit per-call
    // systemInstruction always wins; when the caller omits it
    // (undefined/null), fall back to the saved systemInstruction +
    // businessContext, composed together, so callers (e.g. the WhatsApp
    // AI-automation service) don't have to fetch settings themselves just
    // to pass them through.
    const baseSystemInstruction =
      request.systemInstruction !== undefined && request.systemInstruction !== null
        ? request.systemInstruction
        : composeStoredInstruction(record.systemInstruction, record.businessContext);

    // additionalInstructions (e.g. a WhatsApp menu option's per-option AI
    // Instructions) is appended ON TOP of the base above, never replacing
    // it — see OryCMSGeminiGenerateRequest.additionalInstructions's doc
    // comment.
    const additional = request.additionalInstructions?.trim();
    const effectiveSystemInstruction = additional
      ? [baseSystemInstruction, additional].filter((part) => part && part.trim()).join("\n\n")
      : baseSystemInstruction;

    const apiKey = decryptOryCMSGeminiApiKey(record.apiKey);
    const result = await generateOryCMSGeminiContent(apiKey, record.model, {
      systemInstruction: effectiveSystemInstruction,
      userMessage: request.userMessage,
      temperature: record.temperature,
      maxOutputTokens: record.maxOutputTokens,
    });

    if (!result.ok) {
      return fail(result.code, result.message, record.model);
    }

    return {
      success: true,
      provider: ORYCMS_GEMINI_PROVIDER_ID,
      model: record.model,
      text: result.text,
      usage: result.usage,
      error: null,
    };
  },
};
