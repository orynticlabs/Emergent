import { parseOryCMSMetaWebhookPayload } from "./providers/meta.inbound";
import type { OryCMSWhatsAppProvider } from "./whatsapp.types";
import type { OryCMSWhatsAppWebhookParseResult } from "./whatsapp.inbound.types";

/**
 * Dispatches a webhook body to the right provider-specific parser. This is
 * the ONLY place that maps "which provider is configured" to "which
 * parser runs" — the webhook route calls this and only this, never a
 * provider parser directly, so adding Twilio/360dialog/Gupshup/Interakt
 * later means adding one case here and one new providers/*.ts file. The
 * webhook route and any future automation layer stay unchanged.
 */
export function normalizeOryCMSWhatsAppWebhookPayload(
  provider: OryCMSWhatsAppProvider,
  body: unknown,
): OryCMSWhatsAppWebhookParseResult {
  switch (provider) {
    case "meta":
      return parseOryCMSMetaWebhookPayload(body);
    // Twilio / 360dialog / Gupshup / Interakt: schema and settings already
    // support selecting these providers (see whatsapp.types.ts), but no
    // parser exists yet — safely produce zero messages rather than
    // guessing at a payload shape nobody has implemented.
    default:
      return { messages: [], malformed: false };
  }
}
