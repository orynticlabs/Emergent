import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { ensureOryCMSPaymentsSchema } from "./payments.schema";

export interface OryCMSPaymentLinkRecord {
  id: string;
  razorpayLinkId: string;
  amount: string; // BIGINT comes back as string from node-pg
  currency: string;
  description: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerContact: string | null;
  status: string;
  shortUrl: string;
  createdBy: string | null;
  createdAt: string;
}

export interface OryCMSCreatePaymentLinkRecordInput {
  razorpayLinkId: string;
  amount: number;
  currency: string;
  description?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerContact?: string | null;
  status: string;
  shortUrl: string;
  createdBy: string;
}

export async function createOryCMSPaymentLinkRecord(
  input: OryCMSCreatePaymentLinkRecordInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPaymentLinkRecord> {
  await ensureOryCMSPaymentsSchema(pool);

  const result = await pool.query<OryCMSPaymentLinkRecord>(
    `INSERT INTO orycms_payment_links
       (id, "razorpayLinkId", amount, currency, description, "customerName",
        "customerEmail", "customerContact", status, "shortUrl", "createdBy", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING id, "razorpayLinkId", amount, currency, description, "customerName",
               "customerEmail", "customerContact", status, "shortUrl", "createdBy", "createdAt"`,
    [
      input.razorpayLinkId,
      input.amount,
      input.currency,
      input.description ?? null,
      input.customerName ?? null,
      input.customerEmail ?? null,
      input.customerContact ?? null,
      input.status,
      input.shortUrl,
      input.createdBy,
    ],
  );

  return result.rows[0];
}

export async function listOryCMSPaymentLinks(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPaymentLinkRecord[]> {
  await ensureOryCMSPaymentsSchema(pool);

  const result = await pool.query<OryCMSPaymentLinkRecord>(
    `SELECT id, "razorpayLinkId", amount, currency, description, "customerName",
            "customerEmail", "customerContact", status, "shortUrl", "createdBy", "createdAt"
     FROM orycms_payment_links
     ORDER BY "createdAt" DESC
     LIMIT 200`,
  );

  return result.rows;
}
