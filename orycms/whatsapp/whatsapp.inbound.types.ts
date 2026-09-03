import type { OryCMSWhatsAppProvider } from "./whatsapp.types";

/**
 * Provider-agnostic incoming-message types — Step 6. Every WhatsApp BSP
 * (Meta, Twilio, 360dialog, Gupshup, Interakt) sends webhook payloads in
 * its own shape; this is the single normalized shape everything downstream
 * of the webhook (a future automation/AI-reply layer — not built yet) is
 * meant to consume, so that layer never needs to know which provider a
 * message came from. Provider-specific parsing lives in ./providers/*.ts
 * and is the ONLY code that imports a provider's raw payload shape.
 *
 * Deliberately lean — only the fields something downstream could plausibly
 * need. No raw payload field on purpose: keeping the full provider payload
 * off this type is what makes "never log full customer message payloads"
 * hard to violate by accident later (there's nothing to log because
 * nothing here carries the whole payload).
 */

export type OryCMSWhatsAppInboundMessageType = "text" | "unsupported";

export interface OryCMSWhatsAppInboundMessage {
  /** Which BSP delivered this message — see OryCMSWhatsAppProvider. */
  provider: OryCMSWhatsAppProvider;
  /** Provider's own message id (e.g. Meta's "wamid...."), for idempotency in a future step. */
  messageId: string;
  /** The customer's WhatsApp id/phone number (sender) — e.g. Meta's "wa_id"/"from". */
  customerId: string;
  /** Contact display name, when the provider includes one. Not guaranteed. */
  contactName: string | null;
  /** The business phone number id that received the message, when the provider reports it — lets a future multi-number setup route by destination. */
  businessPhoneNumberId: string | null;
  /** ISO 8601. Providers report Unix seconds or their own format; parsers normalize to this. */
  timestamp: string;
  /** "unsupported" for any message type this step doesn't parse content for (image, audio, location, interactive, ...) — still reported so a future step can see traffic exists without this step needing to handle it. */
  type: OryCMSWhatsAppInboundMessageType;
  /** Message body for type "text"; always null otherwise. */
  text: string | null;
}

/**
 * Result of normalizing one webhook POST body, which may contain zero or
 * more messages (a single Meta webhook call can batch several) plus
 * non-message events (delivery/read status updates) that are simply not
 * represented here — "safely ignored" per Step 6's instructions.
 */
export interface OryCMSWhatsAppWebhookParseResult {
  messages: OryCMSWhatsAppInboundMessage[];
  /**
   * True when the payload didn't match the expected top-level shape at all
   * (not just "no messages in it," which is the normal case for a status
   * webhook). Parsers never throw — this is how a caller can tell
   * "nothing to do" apart from "this wasn't a recognizable payload,"
   * without needing to inspect payload content (which is not logged).
   */
  malformed: boolean;
}
