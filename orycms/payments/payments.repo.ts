import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSPaymentsSchema } from "./payments.schema";

export interface OryCMSPaymentRecord {
  id: string;
  razorpayPaymentId: string;
  razorpayOrderId: string | null;
  razorpayLinkId: string | null;
  amount: string; // BIGINT comes back as string from node-pg
  currency: string;
  status: string;
  method: string | null;
  email: string | null;
  contact: string | null;
  eventType: string;
  receivedAt: string;
}

export interface OryCMSRecordPaymentInput {
  razorpayPaymentId: string;
  razorpayOrderId?: string | null;
  razorpayLinkId?: string | null;
  amount: number;
  currency: string;
  status: string;
  method?: string | null;
  email?: string | null;
  contact?: string | null;
  eventType: string;
  rawPayload: unknown;
}

/**
 * Upserts a payment row keyed by razorpayPaymentId - this is what makes the
 * webhook handler idempotent against Razorpay's automatic retries and
 * against legitimate status transitions (e.g. "authorized" then later
 * "captured" for the same payment) arriving as separate webhook calls: the
 * second call updates the existing row instead of creating a duplicate.
 */
export async function recordOryCMSPayment(
  input: OryCMSRecordPaymentInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPaymentRecord> {
  await ensureOryCMSPaymentsSchema(pool);

  const result = await pool.query<OryCMSPaymentRecord>(
    `INSERT INTO orycms_payments
       (id, "razorpayPaymentId", "razorpayOrderId", "razorpayLinkId", amount, currency,
        status, method, email, contact, "eventType", "rawPayload", "receivedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
     ON CONFLICT ("razorpayPaymentId") DO UPDATE SET
       status = EXCLUDED.status,
       method = EXCLUDED.method,
       "eventType" = EXCLUDED."eventType",
       "rawPayload" = EXCLUDED."rawPayload",
       "receivedAt" = NOW()
     RETURNING id, "razorpayPaymentId", "razorpayOrderId", "razorpayLinkId", amount, currency,
               status, method, email, contact, "eventType", "receivedAt"`,
    [
      input.razorpayPaymentId,
      input.razorpayOrderId ?? null,
      input.razorpayLinkId ?? null,
      input.amount,
      input.currency,
      input.status,
      input.method ?? null,
      input.email ?? null,
      input.contact ?? null,
      input.eventType,
      JSON.stringify(input.rawPayload),
    ],
  );

  return result.rows[0];
}

export async function listOryCMSPayments(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPaymentRecord[]> {
  await ensureOryCMSPaymentsSchema(pool);

  const result = await pool.query<OryCMSPaymentRecord>(
    `SELECT id, "razorpayPaymentId", "razorpayOrderId", "razorpayLinkId", amount, currency,
            status, method, email, contact, "eventType", "receivedAt"
     FROM orycms_payments
     ORDER BY "receivedAt" DESC
     LIMIT 200`,
  );

  return result.rows;
}

/** Mirrors a payment link's status forward from webhook events (e.g. "paid") onto the link row created via the admin UI. No-op if the link wasn't created through OryCMS (nothing to update). */
export async function updateOryCMSPaymentLinkStatus(
  razorpayLinkId: string,
  status: string,
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await ensureOryCMSPaymentsSchema(pool);
  await pool.query(`UPDATE orycms_payment_links SET status = $1 WHERE "razorpayLinkId" = $2`, [
    status,
    razorpayLinkId,
  ]);
}
