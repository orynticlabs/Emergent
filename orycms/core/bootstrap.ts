import { createOryCMSPostgreSQLAdapter } from "@/database";
import { syncOryCMSDefaultRoles, syncOryCMSDefaultPermissions } from "@/rbac";
import { ensureOryCMSMfaSchema } from "@/auth/mfa.schema";
import { ensureOryCMSPaymentsSchema } from "@/payments/payments.schema";
import { ensureOryCMSWhatsAppSchema } from "@/whatsapp/whatsapp.schema";
import { ensureOryCMSWhatsAppAutomationSchema } from "@/whatsapp/whatsapp.automation.schema";
import { ensureOryCMSWhatsAppMenuSchema } from "@/whatsapp/whatsapp.menu.schema";
import { ensureOryCMSWhatsAppMenuSessionSchema } from "@/whatsapp/whatsapp.menu-session.schema";
import { ensureOryCMSWhatsAppMessagesSchema } from "@/whatsapp/whatsapp.messages.schema";
import { ensureOryCMSWhatsAppConversationModeSchema } from "@/whatsapp/whatsapp.conversation-mode.schema";
import { ensureOryCMSGeminiSchema } from "@/gemini/gemini.schema";
import { getOryCMSPool } from "@/lib/db";
import { installOryCMSCoreSchema } from "./core.migration";
import type { OryCMSCoreInstallResult } from "./core.migration";

export interface OryCMSBootstrapResult {
  install: OryCMSCoreInstallResult;
  seeded: boolean;
}

/**
 * One-shot, idempotent bootstrap for a fresh (or existing) OryCMS database.
 *
 * 1. Installs the core schema (11 system tables) through the PostgreSQL adapter.
 *    installOryCMSCoreSchema checks orycms_migrations, so re-runs are no-ops.
 * 2. Seeds the default roles + permission matrix (Owner/Admin/Editor/Author/Viewer).
 *    Both seeders are ON CONFLICT DO NOTHING / NOT EXISTS guarded - safe to repeat.
 * 3. Ensures the MFA columns exist on orycms_users (ALTER ... IF NOT EXISTS -
 *    safe to repeat, and applies to databases that already existed before
 *    MFA was added, not just fresh installs).
 *
 * DB-agnostic: the adapter reads ORYCMS_DATABASE_URL (Postgres/Neon/Supabase) and
 * the seeders run through the same getOryCMSPool() singleton the routes use, so the
 * identical code path works end-to-end once a real database URL is configured.
 *
 * `pool` is injectable for tests (mocked pg.Pool). When omitted, the shared
 * singleton is used for seeding and the adapter opens its own connection.
 */
export async function bootstrapOryCMS(
  pool = getOryCMSPool(),
): Promise<OryCMSBootstrapResult> {
  const adapter = createOryCMSPostgreSQLAdapter();
  await adapter.connect({ url: process.env.ORYCMS_DATABASE_URL });

  try {
    const install = await installOryCMSCoreSchema(adapter);

    let seeded = false;
    if (install.success) {
      await syncOryCMSDefaultRoles(pool);
      await syncOryCMSDefaultPermissions(pool);
      await ensureOryCMSMfaSchema(pool);
      await ensureOryCMSPaymentsSchema(pool);
      await ensureOryCMSWhatsAppSchema(pool);
      await ensureOryCMSWhatsAppAutomationSchema(pool);
      await ensureOryCMSWhatsAppMenuSchema(pool);
      await ensureOryCMSWhatsAppMenuSessionSchema(pool);
      await ensureOryCMSWhatsAppMessagesSchema(pool);
      await ensureOryCMSWhatsAppConversationModeSchema(pool);
      await ensureOryCMSGeminiSchema(pool);
      seeded = true;
    }

    return { install, seeded };
  } finally {
    await adapter.disconnect();
  }
}
