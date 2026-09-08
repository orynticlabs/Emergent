import { metaOutboundProvider } from "./providers/meta.outbound";
import type { OryCMSWhatsAppOutboundProvider } from "./whatsapp.outbound.provider";
import type { OryCMSWhatsAppProvider } from "./whatsapp.types";
import type {
  OryCMSWhatsAppOutboundCredentials,
  OryCMSWhatsAppSendResult,
  OryCMSWhatsAppSendTextRequest,
} from "./whatsapp.outbound.types";

/**
 * Registry of every outbound provider implementation currently available -
 * mirrors whatsapp.inbound.ts's dispatcher for the opposite direction, and
 * orycms/ai/ai.service.ts's provider registry in spirit. This is the ONE
 * place that maps "which provider is configured" to "which sender runs";
 * whatsapp.service.ts (and anything that calls it) never imports a
 * provider module directly.
 */
const OUTBOUND_PROVIDERS: Partial<Record<OryCMSWhatsAppProvider, OryCMSWhatsAppOutboundProvider>> = {
  meta: metaOutboundProvider,
};

/**
 * Dispatches a send request to the right provider implementation. Twilio /
 * 360dialog / Gupshup / Interakt: schema and settings already support
 * selecting these providers (see whatsapp.types.ts), but no outbound
 * sender exists yet - resolves to a normalized failure rather than
 * guessing at an API nobody has implemented.
 */
export async function sendOryCMSWhatsAppTextMessage(
  provider: OryCMSWhatsAppProvider,
  credentials: OryCMSWhatsAppOutboundCredentials,
  request: OryCMSWhatsAppSendTextRequest,
): Promise<OryCMSWhatsAppSendResult> {
  const impl = OUTBOUND_PROVIDERS[provider];
  if (!impl) {
    return {
      success: false,
      provider,
      messageId: null,
      error: {
        code: "WHATSAPP_PROVIDER_NOT_IMPLEMENTED",
        message: `No outbound sender is implemented for provider "${provider}" yet.`,
      },
    };
  }
  return impl.sendTextMessage(credentials, request);
}
