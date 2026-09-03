/**
 * Static module descriptor — makes the WhatsApp module discoverable to
 * other OryCMS systems (a future settings/module list, health checks,
 * onboarding checklists) without registering any route, page, or sidebar
 * entry. Deliberately NOT passed to orycms/plugins' registerOryCMSPlugin:
 * that registry is for config-declared/file-discovered third-party
 * plugins (see plugins/plugin.loader.ts, driven by orycms.config.ts's
 * `plugins.entries`) — no other first-class built-in resource (payments,
 * seo, mfa) registers itself there, so doing it here would be the
 * "standalone implementation" this step is explicitly told to avoid.
 *
 * The descriptor shape itself lives in orycms/core/module-descriptor.types.ts
 * (shared with orycms/gemini/gemini.module.ts) rather than being defined
 * here, so the two modules don't depend on each other.
 *
 * Plain, side-effect-free data: importing this file never touches the
 * database or performs I/O.
 */

import type { OryCMSModuleDescriptor } from "@/core";

export const ORYCMS_WHATSAPP_MODULE: OryCMSModuleDescriptor = {
  id: "whatsapp",
  name: "WhatsApp",
  description:
    "Connect a WhatsApp Business account to OryCMS. Step 1 ships configuration storage only — no messaging, inbox, or webhook processing yet.",
  resource: "whatsapp",
  permissions: [
    { key: "whatsapp.view", label: "View WhatsApp settings" },
    { key: "whatsapp.manage", label: "Manage WhatsApp settings" },
  ],
  configurable: true,
  status: "configuration-only",
};
