import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import {
  listOryCMSWhatsAppConversations,
  listOryCMSWhatsAppMessagesForCustomer,
  recordOryCMSWhatsAppMessage,
} from "./whatsapp.messages.repo";
import { isOryCMSWhatsAppCustomerAwaitingMenuSelection } from "./whatsapp.menu-session.repo";
import {
  getOryCMSWhatsAppConversationMode,
  setOryCMSWhatsAppConversationMode,
} from "./whatsapp.conversation-mode.repo";
import { OryCMSWhatsAppService } from "./whatsapp.service";
import type {
  OryCMSWhatsAppConversationDetail,
  OryCMSWhatsAppConversationSummary,
} from "./whatsapp.messages.types";
import type { OryCMSWhatsAppSendResult } from "./whatsapp.outbound.types";
import type { OryCMSWhatsAppConversationMode } from "./whatsapp.conversation-mode.types";

/**
 * Service layer for the WhatsApp inbox. Reuses OryCMSWhatsAppService for
 * the actual send (no new provider, no duplicated send logic - see
 * sendManualReply below), whatsapp.menu-session.repo.ts for "awaiting
 * selection" state, and whatsapp.conversation-mode.repo.ts for AI/Human
 * mode (both are the same sources of truth the automation service reads).
 */

export const OryCMSWhatsAppInboxService = {
  async listConversations(
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppConversationSummary[]> {
    return listOryCMSWhatsAppConversations(pool);
  },

  async getConversation(
    customerId: string,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppConversationDetail> {
    const [messages, awaitingMenuSelection, mode] = await Promise.all([
      listOryCMSWhatsAppMessagesForCustomer(customerId, pool),
      isOryCMSWhatsAppCustomerAwaitingMenuSelection(customerId, pool),
      getOryCMSWhatsAppConversationMode(customerId, pool),
    ]);

    // contactName isn't its own column anywhere except on stored
    // messages - use the most recent non-null one seen for this customer.
    const contactName = [...messages].reverse().find((m) => m.contactName)?.contactName ?? null;

    return { customerId, contactName, awaitingMenuSelection, mode, messages };
  },

  /**
   * Switches a customer between AI Mode and Human Mode ("Take Over" /
   * "Resume AI" in the inbox). Nothing about sending or AI generation
   * happens here - this only flips the flag
   * whatsapp.ai-automation.service.ts checks before doing either.
   * `updatedBy` is the admin's user id, for accountability only.
   */
  async setConversationMode(
    customerId: string,
    mode: OryCMSWhatsAppConversationMode,
    updatedBy: string | null,
    pool: Pool = getOryCMSPool(),
  ): Promise<void> {
    await setOryCMSWhatsAppConversationMode(customerId, mode, updatedBy, pool);
  },

  /**
   * Sends a manual admin reply through the exact same
   * OryCMSWhatsAppService.sendTextMessage() the AI/menu automation flow
   * uses (no new provider, no duplicated send logic), then records it with
   * sender "admin" on success so it appears in the timeline. RBAC is
   * enforced by the route (guardOryCMS) before this is ever called - this
   * function itself has no permission logic, matching every other
   * service in this codebase.
   */
  async sendManualReply(
    customerId: string,
    text: string,
    pool: Pool = getOryCMSPool(),
  ): Promise<OryCMSWhatsAppSendResult> {
    if (!customerId || !customerId.trim()) {
      return {
        success: false,
        provider: "meta",
        messageId: null,
        error: { code: "WHATSAPP_INVALID_REQUEST", message: "customerId is required." },
      };
    }
    if (!text || !text.trim()) {
      return {
        success: false,
        provider: "meta",
        messageId: null,
        error: { code: "WHATSAPP_INVALID_REQUEST", message: "text is required." },
      };
    }

    // sendTextMessage() already returns a normalized WHATSAPP_NOT_CONFIGURED
    // failure when nothing is saved yet - no need to duplicate that check.
    const result = await OryCMSWhatsAppService.sendTextMessage(customerId, text, pool);

    if (result.success) {
      await recordOryCMSWhatsAppMessage(
        {
          customerId,
          provider: result.provider,
          direction: "outbound",
          sender: "admin",
          providerMessageId: result.messageId,
          text,
        },
        pool,
      );
    }

    return result;
  },
};
