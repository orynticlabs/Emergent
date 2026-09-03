/**
 * Human handoff — per-customer conversation mode. "ai" (default): the
 * automation service (menu + direct AI auto-reply) handles incoming
 * messages as usual. "human": an admin has taken over, so the automation
 * service stores incoming messages but does not generate or send any
 * reply — only a manual reply (via the existing WhatsApp send service) can
 * respond while a conversation is in this mode.
 */
export type OryCMSWhatsAppConversationMode = "ai" | "human";

export interface OryCMSWhatsAppConversationModeRecord {
  customerId: string;
  mode: OryCMSWhatsAppConversationMode;
  updatedAt: string;
}

export function isOryCMSWhatsAppConversationMode(
  value: unknown,
): value is OryCMSWhatsAppConversationMode {
  return value === "ai" || value === "human";
}
