import type { OryCMSWhatsAppOutboundProvider } from "../whatsapp.outbound.provider";
import type {
  OryCMSWhatsAppOutboundCredentials,
  OryCMSWhatsAppSendResult,
  OryCMSWhatsAppSendTextRequest,
} from "../whatsapp.outbound.types";

/**
 * Meta (WhatsApp Cloud API) outbound sender — the ONLY file that knows
 * Meta's specific send-message request/response shape, mirroring
 * providers/meta.inbound.ts's role for the inbound direction. Adding a
 * second outbound provider (Twilio, 360dialog, Gupshup, Interakt) means
 * adding a sibling file here exporting the same OryCMSWhatsAppOutboundProvider
 * shape, wired in by whatsapp.outbound.ts's registry — nothing about the
 * normalized types, whatsapp.service.ts, or a future automation layer
 * changes.
 *
 * The access token is sent exclusively via the `Authorization: Bearer`
 * header — never a URL query string (Meta's Graph API does accept
 * `?access_token=`, but a header can't leak into server/proxy access logs
 * or browser history the way a URL can, so only the header form is used
 * here) — and never logged or included in any returned value.
 */

const META_GRAPH_API_VERSION = "v21.0";
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

function fail(message: { code: string; message: string }): OryCMSWhatsAppSendResult {
  return { success: false, provider: "meta", messageId: null, error: message };
}

export const metaOutboundProvider: OryCMSWhatsAppOutboundProvider = {
  provider: "meta",

  async sendTextMessage(
    credentials: OryCMSWhatsAppOutboundCredentials,
    request: OryCMSWhatsAppSendTextRequest,
  ): Promise<OryCMSWhatsAppSendResult> {
    let res: Response;
    try {
      res = await fetch(`${META_GRAPH_API_BASE}/${encodeURIComponent(credentials.phoneNumberId)}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: request.customerId,
          type: "text",
          text: { body: request.text, preview_url: false },
        }),
      });
    } catch {
      return fail({
        code: "WHATSAPP_NETWORK_ERROR",
        message: "Couldn't reach the WhatsApp Cloud API. Check network connectivity and try again.",
      });
    }

    if (res.status === 401 || res.status === 403) {
      return fail({
        code: "WHATSAPP_INVALID_ACCESS_TOKEN",
        message: "WhatsApp rejected the access token. Check that it's correct and still active.",
      });
    }

    if (res.status === 400) {
      return fail({
        code: "WHATSAPP_INVALID_REQUEST",
        message: "WhatsApp rejected the request (invalid recipient, phone number id, or message).",
      });
    }

    if (res.status === 429) {
      return fail({
        code: "WHATSAPP_RATE_LIMITED",
        message: "WhatsApp rate-limited this request. Try again shortly.",
      });
    }

    if (!res.ok) {
      return fail({
        code: "WHATSAPP_REQUEST_FAILED",
        message: `WhatsApp Cloud API returned an unexpected error (HTTP ${res.status}).`,
      });
    }

    type MetaSendResponse = {
      messages?: { id?: string }[];
    };

    const data = (await res.json().catch(() => null)) as MetaSendResponse | null;
    const messageId = data?.messages?.[0]?.id;

    if (!data || typeof messageId !== "string" || !messageId) {
      return fail({
        code: "WHATSAPP_INVALID_RESPONSE",
        message: "WhatsApp returned a response that couldn't be parsed.",
      });
    }

    return { success: true, provider: "meta", messageId, error: null };
  },
};
