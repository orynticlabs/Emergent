import type { OryCMSResource } from "@/rbac";

/**
 * Shared shape for a first-class OryCMS module's static descriptor -
 * makes a module discoverable (a future settings/module list, health
 * checks, onboarding checklists) without registering a route, page, or
 * sidebar entry. See orycms/whatsapp/whatsapp.module.ts and
 * orycms/gemini/gemini.module.ts for the two modules that currently use
 * this shape, and their header comments for why this is NOT the same as
 * orycms/plugins' registerOryCMSPlugin (that registry is for
 * config-declared/file-discovered third-party plugins only).
 *
 * Lives in orycms/core rather than inside either module so two sibling
 * modules (e.g. whatsapp and gemini) can each depend on this shared type
 * without depending on each other.
 */
export interface OryCMSModuleDescriptor {
  id: string;
  name: string;
  description: string;
  /** RBAC resource this module is gated behind - see rbac/rbac.engine.ts. */
  resource: OryCMSResource;
  /** Human-readable capability keys this module exposes, for a future permissions UI. Enforcement itself runs through the resource:action pairs above, not these strings. */
  permissions: { key: string; label: string }[];
  /** True once the module has a settings table and repository/service layer, independent of whether its core function (sending, generating, etc.) is implemented yet. */
  configurable: boolean;
  status: "configuration-only" | "active";
}
