/**
 * Static module descriptor - makes the Gemini AI plugin discoverable to
 * other OryCMS systems (a future settings/module list, health checks,
 * onboarding checklists) without registering any route, page, or sidebar
 * entry beyond what this step already builds. Deliberately NOT passed to
 * orycms/plugins' registerOryCMSPlugin: that registry is for
 * config-declared/file-discovered third-party plugins (see
 * plugins/plugin.loader.ts, driven by orycms.config.ts's `plugins.entries`)
 * - no other first-class built-in module (payments, seo, mfa, whatsapp)
 * registers itself there. See orycms/whatsapp/whatsapp.module.ts for the
 * same reasoning, applied consistently here.
 *
 * Gated on the existing "ai" RBAC resource (already seeded with Super
 * Admin/Admin: manage, Editor/Author: read - see rbac/rbac.engine.ts) -
 * that resource is the shared gate every AI provider module uses, so
 * adding a second provider later doesn't require a new resource or a
 * WhatsApp-specific permission.
 *
 * The descriptor shape itself lives in orycms/core/module-descriptor.types.ts
 * (shared with orycms/whatsapp/whatsapp.module.ts) rather than being
 * defined here, so the two modules don't depend on each other.
 *
 * Plain, side-effect-free data: importing this file never touches the
 * database or performs I/O.
 */

import type { OryCMSModuleDescriptor } from "@/core";

export const ORYCMS_GEMINI_MODULE: OryCMSModuleDescriptor = {
  id: "gemini-ai",
  name: "Gemini AI",
  description:
    "Connect a Gemini API key to OryCMS. Configuration and a connection test only in this step - no provider is wired to generate content or reply to messages yet.",
  resource: "ai",
  permissions: [
    { key: "ai.view", label: "View AI plugin settings" },
    { key: "ai.manage", label: "Manage AI plugin settings" },
  ],
  configurable: true,
  status: "configuration-only",
};
