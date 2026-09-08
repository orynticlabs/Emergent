import type { OryCMSWhatsAppProvider } from "./whatsapp.types";

/**
 * Provider-agnostic outbound-message types - Step 7. Mirrors
 * whatsapp.inbound.types.ts's shape/spirit for the opposite direction:
 * everything downstream of "I want to send a WhatsApp text message" (a
 * future automation/AI-reply layer - not built yet) works against these
 * types and orycms/whatsapp/whatsapp.outbound.provider.ts's interface,
 * never against a provider's own request/response shape directly.
 */

export interface OryCMSWhatsAppSendTextRequest {
  /** Recipient's WhatsApp id/phone number (E.164, no "+"), e.g. Meta's "to". */
  customerId: string;
  text: string;
}

/**
 * Normalized result every outbound provider's sendTextMessage() resolves
 * to - never throws; every failure (not configured, invalid request,
 * upstream API error) comes back as `{ success: false, error }` instead,
 * the same contract orycms/ai's OryCMSAIGenerateResult uses. Never
 * contains an access token or any other credential.
 */
export type OryCMSWhatsAppSendResult =
  | {
      success: true;
      provider: OryCMSWhatsAppProvider;
      messageId: string;
      error: null;
    }
  | {
      success: false;
      provider: OryCMSWhatsAppProvider;
      messageId: null;
      error: { code: string; message: string };
    };

/**
 * Decrypted credentials an outbound provider needs to actually send -
 * passed in by the caller (whatsapp.service.ts), never fetched or
 * decrypted by the provider implementation itself. Provider-agnostic on
 * purpose: Twilio/360dialog/Gupshup/Interakt providers would take the same
 * shape even though their own APIs authenticate differently, keeping this
 * type (and the interface it's used with) stable as providers are added.
 */
export interface OryCMSWhatsAppOutboundCredentials {
  accessToken: string;
  phoneNumberId: string;
}
