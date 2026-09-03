import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSWhatsAppMessagesSchema } from "./whatsapp.messages.schema";
import type {
  OryCMSRecordWhatsAppMessageInput,
  OryCMSWhatsAppConversationSummary,
  OryCMSWhatsAppMessageRecord,
} from "./whatsapp.messages.types";

/**
 * Repository for orycms_whatsapp_messages — plain persistence only, no
 * decisions about what to store or when (that lives at each call site in
 * whatsapp.ai-automation.service.ts and the manual-reply route, matching
 * the split every other OryCMS repository follows).
 */

const COLUMNS = `id, "customerId", "contactName", provider, direction, sender, "providerMessageId", text, "createdAt"`;

export async function recordOryCMSWhatsAppMessage(
  input: OryCMSRecordWhatsAppMessageInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSWhatsAppMessageRecord> {
  await ensureOryCMSWhatsAppMessagesSchema(pool);
  const result = await pool.query<OryCMSWhatsAppMessageRecord>(
    `INSERT INTO orycms_whatsapp_messages
       (id, "customerId", "contactName", provider, direction, sender, "providerMessageId", text, "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING ${COLUMNS}`,
    [
      input.customerId,
      input.contactName ?? null,
      input.provider,
      input.direction,
      input.sender,
      input.providerMessageId ?? null,
      input.text,
    ],
  );
  return result.rows[0];
}

/** Every message for one customer, oldest first — a natural chat timeline. */
export async function listOryCMSWhatsAppMessagesForCustomer(
  customerId: string,
  pool: Pool = getOryCMSPool(),
  limit = 500,
): Promise<OryCMSWhatsAppMessageRecord[]> {
  await ensureOryCMSWhatsAppMessagesSchema(pool);
  const result = await pool.query<OryCMSWhatsAppMessageRecord>(
    `SELECT ${COLUMNS} FROM orycms_whatsapp_messages
     WHERE "customerId" = $1
     ORDER BY "createdAt" ASC
     LIMIT $2`,
    [customerId, limit],
  );
  return result.rows;
}

/**
 * One row per customer — their most recent message, ordered by how
 * recently each conversation had activity. `DISTINCT ON` picks the latest
 * row per customerId (Postgres-specific, matches the "customerId,
 * createdAt" index above); the outer query re-sorts those across
 * customers.
 */
export async function listOryCMSWhatsAppConversations(
  pool: Pool = getOryCMSPool(),
  limit = 200,
): Promise<OryCMSWhatsAppConversationSummary[]> {
  await ensureOryCMSWhatsAppMessagesSchema(pool);

  const result = await pool.query<{
    customerId: string;
    contactName: string | null;
    text: string;
    sender: OryCMSWhatsAppConversationSummary["lastMessage"]["sender"];
    direction: OryCMSWhatsAppConversationSummary["lastMessage"]["direction"];
    createdAt: string;
    messageCount: string;
  }>(
    `SELECT latest."customerId", latest."contactName", latest.text, latest.sender,
            latest.direction, latest."createdAt", counts."messageCount"
     FROM (
       SELECT DISTINCT ON ("customerId") "customerId", "contactName", text, sender, direction, "createdAt"
       FROM orycms_whatsapp_messages
       ORDER BY "customerId", "createdAt" DESC
     ) latest
     JOIN (
       SELECT "customerId", COUNT(*)::text AS "messageCount"
       FROM orycms_whatsapp_messages
       GROUP BY "customerId"
     ) counts ON counts."customerId" = latest."customerId"
     ORDER BY latest."createdAt" DESC
     LIMIT $1`,
    [limit],
  );

  return result.rows.map((row) => ({
    customerId: row.customerId,
    contactName: row.contactName,
    lastMessage: {
      text: row.text,
      sender: row.sender,
      direction: row.direction,
      createdAt: row.createdAt,
    },
    messageCount: Number(row.messageCount),
  }));
}
