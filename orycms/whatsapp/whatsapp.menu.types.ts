/**
 * WhatsApp menu configuration types - Step 10. Configuration only: no
 * webhook wiring, no routing, no AI replies triggered by a menu selection
 * yet (see whatsapp.ai-automation.service.ts for the unrelated text-message
 * auto-reply flow Step 8 built - this module doesn't touch it).
 */

// Generous but bounded - matches the "Number (1-9)" requirement exactly;
// WhatsApp quick-reply/numbered-menu UX conventions max out around a
// single-digit list anyway.
export const ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MIN = 1;
export const ORYCMS_WHATSAPP_MENU_OPTION_NUMBER_MAX = 9;
export const ORYCMS_WHATSAPP_MENU_MAX_OPTIONS = 9;

export const ORYCMS_WHATSAPP_MENU_TITLE_MAX_LENGTH = 100;
export const ORYCMS_WHATSAPP_MENU_AI_INSTRUCTIONS_MAX_LENGTH = 2000;
export const ORYCMS_WHATSAPP_MENU_WELCOME_MESSAGE_MAX_LENGTH = 1000;

// ── Persisted shapes ─────────────────────────────────────────────────────────

export interface OryCMSWhatsAppMenuSettingsRecord {
  id: string;
  enabled: boolean;
  welcomeMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSWhatsAppMenuOptionRecord {
  id: string;
  number: number;
  title: string;
  aiInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What GET/PATCH actually return - the singleton settings merged with its options, ordered by number. Nothing here is a secret, so unlike whatsapp.types.ts/gemini.types.ts there is no "safe" projection to strip. */
export interface OryCMSWhatsAppMenuSettings {
  enabled: boolean;
  welcomeMessage: string | null;
  options: OryCMSWhatsAppMenuOptionRecord[];
}

// ── Write inputs ───────────────────────────────────────────────────────────────

export interface OryCMSWhatsAppMenuOptionInput {
  number: number;
  title: string;
  aiInstructions?: string | null;
}

/** Input to the service/PATCH route - any field omitted is left untouched; `options`, when present, REPLACES the entire option list (this is how add/edit/delete are all expressed through one PATCH call - see whatsapp.menu.repo.ts's replaceOryCMSWhatsAppMenuOptions). */
export interface OryCMSUpdateWhatsAppMenuInput {
  enabled?: boolean;
  welcomeMessage?: string | null;
  options?: OryCMSWhatsAppMenuOptionInput[];
}
