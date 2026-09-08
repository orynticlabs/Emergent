import type {
  OryCMSWhatsAppInboundMessage,
  OryCMSWhatsAppWebhookParseResult,
} from "../whatsapp.inbound.types";

/**
 * Meta (WhatsApp Cloud API) webhook payload parser - the ONLY file that
 * knows Meta's specific JSON shape. Adding a second provider (Twilio,
 * 360dialog, Gupshup, Interakt) means adding a sibling file here that
 * exports the same `(body: unknown) => OryCMSWhatsAppWebhookParseResult`
 * shape, wired in by whatsapp.inbound.ts's dispatcher - nothing about the
 * normalized type or the webhook route changes.
 *
 * Meta's documented shape (trimmed to what's used):
 * {
 *   object: "whatsapp_business_account",
 *   entry: [{
 *     id: string,
 *     changes: [{
 *       field: "messages",
 *       value: {
 *         metadata: { phone_number_id: string, display_phone_number: string },
 *         contacts?: [{ profile?: { name?: string }, wa_id: string }],
 *         messages?: [{ id, from, timestamp, type, text?: { body } }],
 *         statuses?: [...] // delivery/read receipts - no "messages" key, safely ignored
 *       }
 *     }]
 *   }]
 * }
 *
 * Never throws: any shape that doesn't match what's expected is treated as
 * "malformed" or simply produces no messages, never an exception - a
 * malformed/unexpected payload must not be able to crash the webhook route
 * (Meta interprets a failure as "retry me," and a route that 500s on a
 * payload it doesn't understand yet would loop forever on that payload).
 * Never logs payload content - only structural booleans/counts may be
 * logged by the caller.
 */
export function parseOryCMSMetaWebhookPayload(body: unknown): OryCMSWhatsAppWebhookParseResult {
  try {
    if (!isPlainObject(body) || body.object !== "whatsapp_business_account") {
      return { messages: [], malformed: true };
    }

    const entries = Array.isArray(body.entry) ? body.entry : [];
    const messages: OryCMSWhatsAppInboundMessage[] = [];

    for (const entry of entries) {
      if (!isPlainObject(entry)) continue;
      const changes = Array.isArray(entry.changes) ? entry.changes : [];

      for (const change of changes) {
        if (!isPlainObject(change) || !isPlainObject(change.value)) continue;
        const value = change.value;

        const businessPhoneNumberId =
          isPlainObject(value.metadata) && typeof value.metadata.phone_number_id === "string"
            ? value.metadata.phone_number_id
            : null;

        const contactNameByWaId = new Map<string, string>();
        if (Array.isArray(value.contacts)) {
          for (const contact of value.contacts) {
            if (
              isPlainObject(contact) &&
              typeof contact.wa_id === "string" &&
              isPlainObject(contact.profile) &&
              typeof contact.profile.name === "string"
            ) {
              contactNameByWaId.set(contact.wa_id, contact.profile.name);
            }
          }
        }

        const rawMessages = Array.isArray(value.messages) ? value.messages : [];
        for (const raw of rawMessages) {
          const normalized = normalizeMetaMessage(raw, businessPhoneNumberId, contactNameByWaId);
          if (normalized) messages.push(normalized);
        }
        // value.statuses (delivery/read receipts) and any other "field"
        // (e.g. account_alerts) have no "messages" array - nothing to do,
        // safely ignored by simply not producing a normalized message.
      }
    }

    return { messages, malformed: false };
  } catch {
    // Any unexpected shape (missing field, wrong type deep in the tree)
    // ends up here rather than propagating - see the function-level note.
    return { messages: [], malformed: true };
  }
}

function normalizeMetaMessage(
  raw: unknown,
  businessPhoneNumberId: string | null,
  contactNameByWaId: Map<string, string>,
): OryCMSWhatsAppInboundMessage | null {
  if (!isPlainObject(raw)) return null;

  const { id, from, timestamp, type } = raw;
  if (typeof id !== "string" || typeof from !== "string" || typeof type !== "string") {
    return null;
  }

  const isoTimestamp = normalizeMetaTimestamp(timestamp);
  const contactName = contactNameByWaId.get(from) ?? null;

  if (type === "text" && isPlainObject(raw.text) && typeof raw.text.body === "string") {
    return {
      provider: "meta",
      messageId: id,
      customerId: from,
      contactName,
      businessPhoneNumberId,
      timestamp: isoTimestamp,
      type: "text",
      text: raw.text.body,
    };
  }

  // Any other message type (image, audio, video, document, location,
  // contacts, interactive, button, sticker, reaction, ...) - recorded as
  // "unsupported" per Step 6's "safely ignore unsupported message types,"
  // rather than dropped entirely, so a future step can see traffic exists.
  return {
    provider: "meta",
    messageId: id,
    customerId: from,
    contactName,
    businessPhoneNumberId,
    timestamp: isoTimestamp,
    type: "unsupported",
    text: null,
  };
}

/** Meta sends Unix seconds as a string. Falls back to "now" if unparseable rather than throwing. */
function normalizeMetaTimestamp(value: unknown): string {
  const seconds = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(seconds)) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
