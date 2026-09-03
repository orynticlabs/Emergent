import path from "path";
import crypto from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import type {
  OryCMSStorageAdapter,
  OryCMSStorageUploadInput,
  OryCMSStorageUploadResult,
} from "./storage.types";

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "text/plain": ".txt",
  "text/csv": ".csv",
};

function uploadDir(): string {
  return path.join(process.cwd(), "public", "uploads");
}

/**
 * Default storage: writes to public/uploads on the local filesystem. Fine
 * for local dev, but this directory does NOT persist across deploys on most
 * hosts (serverless, containers) — use the "cloudinary" provider for
 * anything beyond local development.
 */
export function createLocalStorageAdapter(): OryCMSStorageAdapter {
  return {
    name: "local",
    async upload(input: OryCMSStorageUploadInput): Promise<OryCMSStorageUploadResult> {
      const ext = EXT_MAP[input.mimeType] ?? "";
      const storedName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir(), storedName);

      await mkdir(uploadDir(), { recursive: true });
      await writeFile(filePath, input.buffer);

      return { url: `/uploads/${storedName}`, ref: filePath };
    },
    async delete(ref: string): Promise<void> {
      try {
        await unlink(ref);
      } catch {
        // ignore ENOENT — already gone
      }
    },
  };
}
