import type { OryCMSWhatsAppProvider } from "./whatsapp.types";
import type {
  OryCMSWhatsAppOutboundCredentials,
  OryCMSWhatsAppSendResult,
  OryCMSWhatsAppSendTextRequest,
} from "./whatsapp.outbound.types";

/**
 * The contract every outbound WhatsApp provider implements - mirrors
 * orycms/ai/ai.provider.ts's OryCMSAIProvider shape/spirit for the
 * messaging side. whatsapp.outbound.ts (the dispatcher) is the only code
 * that calls this interface; a future automation layer calls
 * OryCMSWhatsAppService.sendTextMessage(), never a provider directly.
 */
export interface OryCMSWhatsAppOutboundProvider {
  /** Stable identifier for this provider - must match one of OryCMSWhatsAppProvider's values. */
  readonly provider: OryCMSWhatsAppProvider;

  /**
   * Sends a text message. Never throws - every failure (invalid
   * credentials, invalid recipient, upstream API error, network failure)
   * resolves to `{ success: false, error }`. Credentials are passed in
   * already decrypted; the implementation must never log them.
   */
  sendTextMessage(
    credentials: OryCMSWhatsAppOutboundCredentials,
    request: OryCMSWhatsAppSendTextRequest,
  ): Promise<OryCMSWhatsAppSendResult>;
}
