import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";

/**
 * Two auxiliary tables for the Razorpay integration, created the same way
 * mfa.schema.ts evolves orycms_users: idempotent DDL (IF NOT EXISTS), safe
 * to run repeatedly, ensured lazily on first use rather than depending on a
 * full /auth/setup re-run (see ensureOryCMSPaymentsSchema below).
 *
 * "orycms_payment_links" - links created from the admin UI via the Razorpay
 * Payment Links API. "orycms_payments" - payment events recorded from
 * incoming Razorpay webhooks (the "payment received" log); rows are keyed
 * by razorpayPaymentId with an upsert, so webhook retries and status
 * transitions (authorized -> captured) update the same row instead of
 * duplicating it.
 */
const CREATE_PAYMENTS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orycms_payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "razorpayLinkId" TEXT NOT NULL UNIQUE,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  description TEXT,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerContact" TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  "shortUrl" TEXT NOT NULL,
  "createdBy" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orycms_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "razorpayPaymentId" TEXT NOT NULL UNIQUE,
  "razorpayOrderId" TEXT,
  "razorpayLinkId" TEXT,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL,
  method TEXT,
  email TEXT,
  contact TEXT,
  "eventType" TEXT NOT NULL,
  "rawPayload" JSONB,
  "receivedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orycms_payments_received_at_idx ON orycms_payments ("receivedAt" DESC);
CREATE INDEX IF NOT EXISTS orycms_payment_links_created_at_idx ON orycms_payment_links ("createdAt" DESC);
`;

let ensured = false;

/**
 * Creates the payments tables if they don't exist yet. Cheap to call on
 * every request (CREATE ... IF NOT EXISTS is a no-op after the first call),
 * but cached per-process anyway so steady-state requests skip the round
 * trip entirely.
 */
export async function ensureOryCMSPaymentsSchema(pool: Pool = getOryCMSPool()): Promise<void> {
  if (ensured) return;
  await pool.query(CREATE_PAYMENTS_SCHEMA_SQL);
  ensured = true;
}
