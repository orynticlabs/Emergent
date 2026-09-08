import type { OryCMSWhatsAppProvider } from "./whatsapp.types";
import type { OryCMSWhatsAppConversationMode } from "./whatsapp.conversation-mode.types";

/**
 * WhatsApp inbox/conversation-history types. Explicitly building what
 * Steps 8/10 deliberately left out of scope ("Do NOT implement:
 * Conversations/inbox... Customer memory") - this request supersedes that
 * exclusion specifically for message storage; the automation *decision*
 * logic (Steps 8/10) is otherwise unchanged, only instrumented to also
 * persist what it already sends/receives.
 */

/**
 * Who/what produced an outbound message, or that it's an inbound customer
 * message. Distinct from `direction` (inbound/outbound) so the inbox UI
 * can style "customer" vs "ai" vs "menu" (automated welcome/invalid-option
 * text) vs "admin" (manual reply) differently, per "clearly distinguish AI
 * replies and customer messages."
 */
export type OryCMSWhatsAppMessageSender = "customer" | "ai" | "menu" | "admin";
export type OryCMSWhatsAppMessageDirection = "inbound" | "outbound";

export interface OryCMSWhatsAppMessageRecord {
  id: string;
  customerId: string;
  contactName: string | null;
  provider: OryCMSWhatsAppProvider;
  direction: OryCMSWhatsAppMessageDirection;
  sender: OryCMSWhatsAppMessageSender;
  /** Provider message id when available - Meta's wamid for inbound, the id sendTextMessage() returned for a successful outbound send. Null for outbound sends made before any id was known, or an inbound message a provider didn't report one for. */
  providerMessageId: string | null;
  text: string;
  createdAt: string;
}

export interface OryCMSRecordWhatsAppMessageInput {
  customerId: string;
  contactName?: string | null;
  provider: OryCMSWhatsAppProvider;
  direction: OryCMSWhatsAppMessageDirection;
  sender: OryCMSWhatsAppMessageSender;
  providerMessageId?: string | null;
  text: string;
}

/** One row per customer in the conversation list - their most recent message plus enough to render a list item. */
export interface OryCMSWhatsAppConversationSummary {
  customerId: string;
  contactName: string | null;
  lastMessage: {
    text: string;
    sender: OryCMSWhatsAppMessageSender;
    direction: OryCMSWhatsAppMessageDirection;
    createdAt: string;
  };
  messageCount: number;
}

/** Full detail for one customer's conversation - the timeline plus current menu-flow and AI/Human mode state, so the inbox can show both without extra round trips. */
export interface OryCMSWhatsAppConversationDetail {
  customerId: string;
  contactName: string | null;
  awaitingMenuSelection: boolean;
  mode: OryCMSWhatsAppConversationMode;
  messages: OryCMSWhatsAppMessageRecord[];
}
