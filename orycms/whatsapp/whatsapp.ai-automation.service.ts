import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAIService } from "@/ai";
import { claimOryCMSWhatsAppMessage, markOryCMSWhatsAppMessageStatus } from "./whatsapp.automation.repo";
import {
  isOryCMSWhatsAppCustomerAwaitingMenuSelection,
  setOryCMSWhatsAppCustomerAwaitingMenuSelection,
} from "./whatsapp.menu-session.repo";
import { OryCMSWhatsAppMenuService } from "./whatsapp.menu.service";
import { OryCMSWhatsAppService } from "./whatsapp.service";
import { recordOryCMSWhatsAppMessage } from "./whatsapp.messages.repo";
import { getOryCMSWhatsAppConversationMode } from "./whatsapp.conversation-mode.repo";
import type { OryCMSWhatsAppInboundMessage } from "./whatsapp.inbound.types";
import type { OryCMSWhatsAppMenuOptionRecord, OryCMSWhatsAppMenuSettings } from "./whatsapp.menu.types";
import type { OryCMSWhatsAppMessageSender } from "./whatsapp.messages.types";

/**
 * WhatsApp → AI auto-reply orchestration - Step 8, extended with menu-driven
 * automation. This is the ONLY place that wires the inbound webhook
 * (Step 6), the menu configuration (Step 10), the generic AI layer
 * (Step 4/5), and the outbound sender (Step 7) together. The webhook route
 * (app/api/orycms/whatsapp/webhook/route.ts) does verify → parse →
 * dispatch (one call per normalized message, here, UNCHANGED since Step 8)
 * → acknowledge; this service does check config → (menu or direct) → AI
 * generation → outbound reply.
 *
 * Deliberately never imports orycms/gemini or a WhatsApp provider module
 * directly - every external call goes through OryCMSAIService (generation)
 * or OryCMSWhatsAppService (sending), both of which already own their own
 * config loading, credential decryption, and provider dispatch. That's
 * what keeps this file provider-agnostic on both sides: swapping Gemini
 * for another AI provider, or Meta for another WhatsApp BSP, never touches
 * this file. No new provider and no duplicated AI-calling logic were
 * introduced for the menu flow - it reuses the exact same
 * OryCMSAIService.generate() / OryCMSWhatsAppService.sendTextMessage()
 * calls the direct-reply flow already used, just with one extra
 * `additionalInstructions` value threaded through (see ai.types.ts).
 *
 * Never logs (console.*) API keys, access tokens, phone numbers, prompts,
 * or generated text - see the module-level "no console.* calls" convention
 * already established by orycms/gemini and orycms/whatsapp's other
 * services. whatsapp.automation.repo.ts's dedup table only ever stores an
 * id, provider, and a short outcome label. Message CONTENT is a separate,
 * deliberate exception: every inbound customer message and every
 * successfully-sent outbound message (AI, menu, or a manual admin reply)
 * is persisted to orycms_whatsapp_messages via
 * whatsapp.messages.repo.ts's recordOryCMSWhatsAppMessage() - this is the
 * WhatsApp inbox's storage, not a log, and is the one place this file's
 * "record message content" behavior was added on top of Step 8/10's
 * decision logic, which is otherwise unchanged. The menu-session table
 * (whatsapp.menu-session.repo.ts) still stores only a customerId and a
 * boolean - no selection history.
 */

export type OryCMSWhatsAppAutomationStatus =
  | "replied"
  | "menu_sent"
  | "menu_invalid_option"
  | "skipped_duplicate"
  | "skipped_unsupported"
  | "skipped_human_mode"
  | "skipped_ai_not_configured"
  | "skipped_auto_reply_disabled"
  | "failed_generation"
  | "failed_send"
  | "failed_unexpected";

export interface OryCMSWhatsAppAutomationResult {
  messageId: string;
  status: OryCMSWhatsAppAutomationStatus;
}

/** Persists one message for the inbox. Best-effort - a storage failure must never change the automation outcome already decided (same reasoning as recordAndReturn's status write below). */
async function storeMessage(
  message: OryCMSWhatsAppInboundMessage,
  direction: "inbound" | "outbound",
  sender: OryCMSWhatsAppMessageSender,
  text: string,
  providerMessageId: string | null,
  pool: Pool,
): Promise<void> {
  await recordOryCMSWhatsAppMessage(
    {
      customerId: message.customerId,
      contactName: message.contactName,
      provider: message.provider,
      direction,
      sender,
      providerMessageId,
      text,
    },
    pool,
  ).catch(() => {});
}

async function recordAndReturn(
  messageId: string,
  status: OryCMSWhatsAppAutomationStatus,
  pool: Pool,
): Promise<OryCMSWhatsAppAutomationResult> {
  // Best-effort - a failure to write the status label must never change
  // the outcome already decided, or escalate into the webhook's response.
  await markOryCMSWhatsAppMessageStatus(messageId, status, pool).catch(() => {});
  return { messageId, status };
}

/** "Welcome...\n\n1. Sales\n2. Support\n3. Pricing" - used both for the first-contact welcome and for re-showing the menu after an invalid selection. */
function formatMenuMessage(menu: OryCMSWhatsAppMenuSettings): string {
  const numbered = menu.options
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((option) => `${option.number}. ${option.title}`)
    .join("\n");
  const welcome = menu.welcomeMessage?.trim();
  return [welcome, numbered].filter((part) => part && part.trim()).join("\n\n");
}

/** A bare integer only (e.g. "2", not "I choose 2") - matches "the customer replies with a number." Anything else is treated as an invalid selection, which re-shows the menu rather than silently falling through to a different flow. */
function parseMenuSelection(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : null;
}

async function handleMenuFlow(
  message: OryCMSWhatsAppInboundMessage,
  text: string,
  menu: OryCMSWhatsAppMenuSettings,
  pool: Pool,
): Promise<OryCMSWhatsAppAutomationResult> {
  const awaitingSelection = await isOryCMSWhatsAppCustomerAwaitingMenuSelection(
    message.customerId,
    pool,
  );

  if (!awaitingSelection) {
    // First contact (or no selection currently pending) - send the
    // welcome message + numbered options, then start waiting for a reply.
    const sendResult = await OryCMSWhatsAppService.sendTextMessage(
      message.customerId,
      formatMenuMessage(menu),
      pool,
    );
    if (!sendResult.success) return recordAndReturn(message.messageId, "failed_send", pool);

    await storeMessage(message, "outbound", "menu", formatMenuMessage(menu), sendResult.messageId, pool);

    // Only persist "now waiting" after a successful send - if sending
    // failed, the customer never saw a menu, so the next message from
    // them should retry showing it rather than being treated as a
    // selection reply.
    await setOryCMSWhatsAppCustomerAwaitingMenuSelection(message.customerId, true, pool);
    return recordAndReturn(message.messageId, "menu_sent", pool);
  }

  const selectedNumber = parseMenuSelection(text);
  const matchedOption: OryCMSWhatsAppMenuOptionRecord | undefined =
    selectedNumber !== null ? menu.options.find((o) => o.number === selectedNumber) : undefined;

  if (!matchedOption) {
    const invalidText = `Sorry, that's not a valid option.\n\n${formatMenuMessage(menu)}`;
    const sendResult = await OryCMSWhatsAppService.sendTextMessage(
      message.customerId,
      invalidText,
      pool,
    );
    // Still awaiting a selection either way - no session state change.
    if (!sendResult.success) return recordAndReturn(message.messageId, "failed_send", pool);
    await storeMessage(message, "outbound", "menu", invalidText, sendResult.messageId, pool);
    return recordAndReturn(message.messageId, "menu_invalid_option", pool);
  }

  // Matched a configured option - generate through the same generic
  // OryCMSAIService.generate() the direct-reply flow uses, just with the
  // option's own instructions layered on top of the saved
  // systemInstruction + businessContext (see
  // OryCMSAIGenerateRequest.additionalInstructions and
  // gemini.service.ts's generateContent()).
  const generation = await OryCMSAIService.generate({
    userMessage: text,
    additionalInstructions: matchedOption.aiInstructions,
  });
  if (!generation.success || !generation.text.trim()) {
    return recordAndReturn(message.messageId, "failed_generation", pool);
  }

  const sendResult = await OryCMSWhatsAppService.sendTextMessage(
    message.customerId,
    generation.text,
    pool,
  );
  if (!sendResult.success) return recordAndReturn(message.messageId, "failed_send", pool);
  await storeMessage(message, "outbound", "ai", generation.text, sendResult.messageId, pool);

  // Selection resolved - the next message from this customer starts over
  // (shows the welcome menu again), matching this step's stated scope
  // (no ongoing conversation state beyond one menu interaction).
  await setOryCMSWhatsAppCustomerAwaitingMenuSelection(message.customerId, false, pool);
  return recordAndReturn(message.messageId, "replied", pool);
}

/** Unchanged from Step 8: check config → generate → send, with no menu involved. */
async function handleDirectReply(
  message: OryCMSWhatsAppInboundMessage,
  text: string,
  pool: Pool,
): Promise<OryCMSWhatsAppAutomationResult> {
  const [configured, autoReplyEnabled] = await Promise.all([
    OryCMSAIService.isConfigured(),
    OryCMSAIService.isAutoReplyEnabled(),
  ]);

  if (!configured) {
    return recordAndReturn(message.messageId, "skipped_ai_not_configured", pool);
  }
  if (!autoReplyEnabled) {
    return recordAndReturn(message.messageId, "skipped_auto_reply_disabled", pool);
  }

  const generation = await OryCMSAIService.generate({ userMessage: text });
  if (!generation.success || !generation.text.trim()) {
    return recordAndReturn(message.messageId, "failed_generation", pool);
  }

  const sendResult = await OryCMSWhatsAppService.sendTextMessage(
    message.customerId,
    generation.text,
    pool,
  );
  if (!sendResult.success) return recordAndReturn(message.messageId, "failed_send", pool);
  await storeMessage(message, "outbound", "ai", generation.text, sendResult.messageId, pool);

  return recordAndReturn(message.messageId, "replied", pool);
}

export const OryCMSWhatsAppAIAutomationService = {
  /**
   * Handles exactly one normalized inbound message end to end. Never
   * throws - every failure path resolves to a result object instead, so a
   * caller iterating a batch of messages (the webhook route) can safely
   * await each call without a try/catch per message.
   */
  async handleInboundMessage(
    message: OryCMSWhatsAppInboundMessage,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppAutomationResult> {
    // Duplicate protection FIRST, before any branching - Meta can retry
    // the entire webhook payload, and claiming the id up front means every
    // other check below only ever runs once per real message, even across
    // retries. The trade-off this accepts: if this attempt fails partway
    // through, the message stays claimed and is never retried - chosen
    // deliberately, since "never double-reply" is the explicit requirement
    // and "guarantee eventual delivery" is not.
    const claimed = await claimOryCMSWhatsAppMessage(message.messageId, message.provider, pool);
    if (!claimed) {
      return { messageId: message.messageId, status: "skipped_duplicate" };
    }

    // Store every inbound message for the inbox - including unsupported
    // types, using a placeholder in place of content we don't parse (see
    // whatsapp.inbound.types.ts: "unsupported" messages have text: null).
    await storeMessage(
      message,
      "inbound",
      "customer",
      message.text ?? `[unsupported message type: ${message.type}]`,
      message.messageId,
      pool,
    );

    if (message.type !== "text" || !message.text) {
      return recordAndReturn(message.messageId, "skipped_unsupported", pool);
    }

    // Human handoff: an admin has taken this conversation over via the
    // inbox's "Take Over" button - the message is already stored above,
    // but neither the menu nor the direct-reply flow may generate or send
    // anything while a conversation is in Human Mode. Checked before any
    // other automation decision, same as the duplicate check above.
    const mode = await getOryCMSWhatsAppConversationMode(message.customerId, pool);
    if (mode === "human") {
      return recordAndReturn(message.messageId, "skipped_human_mode", pool);
    }

    // Reused as-is from Step 10's own menu service - configuration only,
    // no menu-specific webhook/routing logic lives outside this file.
    const menu = await OryCMSWhatsAppMenuService.getMenu(pool);

    if (menu.enabled && menu.options.length > 0) {
      return handleMenuFlow(message, message.text, menu, pool);
    }

    // Menu disabled (or enabled with no options configured yet, which is
    // treated the same as disabled) - existing direct AI auto-reply flow,
    // unchanged from Step 8.
    return handleDirectReply(message, message.text, pool);
  },
};
