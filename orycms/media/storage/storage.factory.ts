import type { OryCMSStorageConfig } from "@/config";
import type { OryCMSStorageAdapter } from "./storage.types";
import { createLocalStorageAdapter } from "./local.adapter";
import { createCloudinaryStorageAdapter } from "./cloudinary.adapter";

/**
 * Resolve the effective storage provider from (in priority order):
 *   1. ORYCMS_STORAGE_PROVIDER env var
 *   2. the `storage.provider` block in orycms.config.ts
 *   3. "local" (default — public/uploads on the local filesystem)
 */
export function resolveOryCMSStorageProvider(config?: OryCMSStorageConfig): string {
  return process.env.ORYCMS_STORAGE_PROVIDER ?? config?.provider ?? "local";
}

export function getOryCMSStorageAdapter(config?: OryCMSStorageConfig): OryCMSStorageAdapter {
  return getOryCMSStorageAdapterByName(resolveOryCMSStorageProvider(config));
}

/**
 * Look up an adapter by name rather than the currently-configured provider —
 * needed to delete an asset that was uploaded under a provider different
 * from the one active now (e.g. after switching ORYCMS_STORAGE_PROVIDER).
 */
export function getOryCMSStorageAdapterByName(provider: string): OryCMSStorageAdapter {
  switch (provider) {
    case "cloudinary":
      return createCloudinaryStorageAdapter();
    case "local":
      return createLocalStorageAdapter();
    default:
      throw new Error(
        `OryCMS storage: unsupported provider "${provider}". Supported: "local", "cloudinary".`,
      );
  }
}
