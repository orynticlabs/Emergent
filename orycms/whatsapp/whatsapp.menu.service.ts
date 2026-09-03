import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import {
  getOryCMSWhatsAppMenuSettings,
  listOryCMSWhatsAppMenuOptions,
  replaceOryCMSWhatsAppMenuOptions,
  saveOryCMSWhatsAppMenuSettings,
} from "./whatsapp.menu.repo";
import {
  ORYCMS_WHATSAPP_MENU_AI_INSTRUCTIONS_MAX_LENGTH,
  ORYCMS_WHATSAPP_MENU_MAX_OPTIONS,
  ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MAX,
  ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MIN,
  ORYCMS_WHATSAPP_MENU_TITLE_MAX_LENGTH,
  ORYCMS_WHATSAPP_MENU_WELCOME_MESSAGE_MAX_LENGTH,
} from "./whatsapp.menu.types";
import type {
  OryCMSUpdateWhatsAppMenuInput,
  OryCMSWhatsAppMenuOptionInput,
  OryCMSWhatsAppMenuSettings,
} from "./whatsapp.menu.types";

/**
 * Service layer for the WhatsApp menu builder — Step 10. Configuration
 * only: nothing here is wired to the webhook (Step 6), the AI-automation
 * service (Step 8), or any reply-sending path. A future step that adds
 * numbered-reply routing would read through this service, not around it.
 *
 * No secrets are involved (menu options are plain admin-authored text), so
 * unlike whatsapp.service.ts/gemini.service.ts there's no encrypt/decrypt
 * split — but the "validation lives in the service, not the route or the
 * repository" convention is kept the same.
 */

function assertValidWelcomeMessage(value: string): void {
  if (typeof value !== "string") {
    throw Object.assign(new Error("welcomeMessage must be a string."), {
      code: "WHATSAPP_MENU_INVALID_WELCOME_MESSAGE",
      statusCode: 422,
    });
  }
  if (value.length > ORYCMS_WHATSAPP_MENU_WELCOME_MESSAGE_MAX_LENGTH) {
    throw Object.assign(
      new Error(
        `welcomeMessage must be ${ORYCMS_WHATSAPP_MENU_WELCOME_MESSAGE_MAX_LENGTH} characters or fewer.`,
      ),
      { code: "WHATSAPP_MENU_INVALID_WELCOME_MESSAGE", statusCode: 422 },
    );
  }
}

function assertValidOptions(options: OryCMSWhatsAppMenuOptionInput[]): void {
  if (!Array.isArray(options)) {
    throw Object.assign(new Error("options must be an array."), {
      code: "WHATSAPP_MENU_INVALID_OPTIONS",
      statusCode: 422,
    });
  }

  if (options.length > ORYCMS_WHATSAPP_MENU_MAX_OPTIONS) {
    throw Object.assign(
      new Error(`A menu can have at most ${ORYCMS_WHATSAPP_MENU_MAX_OPTIONS} options.`),
      { code: "WHATSAPP_MENU_TOO_MANY_OPTIONS", statusCode: 422 },
    );
  }

  const seenNumbers = new Set<number>();

  for (const option of options) {
    if (
      typeof option.number !== "number" ||
      !Number.isInteger(option.number) ||
      option.number < ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MIN ||
      option.number > ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MAX
    ) {
      throw Object.assign(
        new Error(
          `Each option's number must be a whole number between ${ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MIN} and ${ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MAX}.`,
        ),
        { code: "WHATSAPP_MENU_INVALID_OPTION_NUMBER", statusCode: 422 },
      );
    }

    if (seenNumbers.has(option.number)) {
      throw Object.assign(new Error(`Option number ${option.number} is used more than once.`), {
        code: "WHATSAPP_MENU_DUPLICATE_OPTION_NUMBER",
        statusCode: 422,
      });
    }
    seenNumbers.add(option.number);

    if (!option.title || !option.title.trim()) {
      throw Object.assign(new Error(`Option ${option.number} needs a title.`), {
        code: "WHATSAPP_MENU_INVALID_OPTION_TITLE",
        statusCode: 422,
      });
    }
    if (option.title.length > ORYCMS_WHATSAPP_MENU_TITLE_MAX_LENGTH) {
      throw Object.assign(
        new Error(
          `Option ${option.number}'s title must be ${ORYCMS_WHATSAPP_MENU_TITLE_MAX_LENGTH} characters or fewer.`,
        ),
        { code: "WHATSAPP_MENU_INVALID_OPTION_TITLE", statusCode: 422 },
      );
    }

    if (
      option.aiInstructions != null &&
      option.aiInstructions.length > ORYCMS_WHATSAPP_MENU_AI_INSTRUCTIONS_MAX_LENGTH
    ) {
      throw Object.assign(
        new Error(
          `Option ${option.number}'s AI Instructions must be ${ORYCMS_WHATSAPP_MENU_AI_INSTRUCTIONS_MAX_LENGTH} characters or fewer.`,
        ),
        { code: "WHATSAPP_MENU_INVALID_OPTION_INSTRUCTIONS", statusCode: 422 },
      );
    }
  }
}

/** Always returns a full OryCMSWhatsAppMenuSettings shape — {enabled:false, welcomeMessage:null, options:[]} when nothing has been saved yet, so the admin page never has to special-case "not configured". Module-level (not on the service object) so updateMenu can call it directly without relying on `this` binding. */
async function loadMenu(pool: Pool): Promise<OryCMSWhatsAppMenuSettings> {
  const [settings, options] = await Promise.all([
    getOryCMSWhatsAppMenuSettings(pool),
    listOryCMSWhatsAppMenuOptions(pool),
  ]);
  return {
    enabled: settings?.enabled ?? false,
    welcomeMessage: settings?.welcomeMessage ?? null,
    options,
  };
}

export const OryCMSWhatsAppMenuService = {
  async getMenu(pool: Pool = getOryCMSPool()): Promise<OryCMSWhatsAppMenuSettings> {
    return loadMenu(pool);
  },

  /**
   * Partial update — enabled/welcomeMessage are only written when present
   * in `patch`; `options`, when present, wholesale-replaces the current
   * option list (add/edit/delete are all just "send the new full list").
   */
  async updateMenu(
    patch: OryCMSUpdateWhatsAppMenuInput,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppMenuSettings> {
    if (patch.welcomeMessage !== undefined && patch.welcomeMessage !== null) {
      assertValidWelcomeMessage(patch.welcomeMessage);
    }
    if (patch.options !== undefined) {
      assertValidOptions(patch.options);
    }

    if (patch.enabled !== undefined || patch.welcomeMessage !== undefined) {
      const existing = await getOryCMSWhatsAppMenuSettings(pool);
      await saveOryCMSWhatsAppMenuSettings(
        {
          enabled: patch.enabled ?? existing?.enabled ?? false,
          welcomeMessage:
            patch.welcomeMessage !== undefined ? patch.welcomeMessage : (existing?.welcomeMessage ?? null),
        },
        pool,
      );
    }

    if (patch.options !== undefined) {
      await replaceOryCMSWhatsAppMenuOptions(patch.options, pool);
    }

    return loadMenu(pool);
  },
};
