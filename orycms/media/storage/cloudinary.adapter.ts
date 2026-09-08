import { Readable } from "stream";
import type {
  OryCMSStorageAdapter,
  OryCMSStorageUploadInput,
  OryCMSStorageUploadResult,
} from "./storage.types";

type CloudinaryResourceType = "image" | "video" | "raw";

function resourceTypeFor(mimeType: string): CloudinaryResourceType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
}

interface CloudinaryModule {
  v2: {
    config(opts: { cloud_name?: string; api_key?: string; api_secret?: string }): void;
    uploader: {
      upload_stream(
        opts: Record<string, unknown>,
        cb: (err: unknown, result: { secure_url: string; public_id: string } | undefined) => void,
      ): NodeJS.WritableStream;
      destroy(publicId: string, opts: { resource_type: CloudinaryResourceType }): Promise<unknown>;
    };
  };
}

let cloudinaryClient: CloudinaryModule["v2"] | null = null;

async function getCloudinaryClient(): Promise<CloudinaryModule["v2"]> {
  if (cloudinaryClient) return cloudinaryClient;

  let mod: CloudinaryModule;
  try {
    mod = (await import("cloudinary")) as unknown as CloudinaryModule;
  } catch {
    throw new Error(
      'OryCMS storage "cloudinary" requires the "cloudinary" package. Install it with: npm install cloudinary',
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'OryCMS storage "cloudinary": missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.',
    );
  }

  mod.v2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  cloudinaryClient = mod.v2;
  return cloudinaryClient;
}

/**
 * Stores media in Cloudinary instead of the local filesystem - the file
 * survives deploys/restarts and gets Cloudinary's CDN + on-the-fly image
 * transforms for free. `ref` is encoded as "resourceType:publicId" since
 * Cloudinary's destroy() needs the resource type to delete non-image files.
 */
export function createCloudinaryStorageAdapter(): OryCMSStorageAdapter {
  return {
    name: "cloudinary",
    async upload(input: OryCMSStorageUploadInput): Promise<OryCMSStorageUploadResult> {
      const cloudinary = await getCloudinaryClient();
      const resourceType = resourceTypeFor(input.mimeType);

      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "orycms", resource_type: resourceType },
            (err, res) => {
              if (err || !res) reject(err ?? new Error("Cloudinary upload returned no result."));
              else resolve(res);
            },
          );
          Readable.from(input.buffer).pipe(stream);
        },
      );

      return { url: result.secure_url, ref: `${resourceType}:${result.public_id}` };
    },
    async delete(ref: string): Promise<void> {
      const cloudinary = await getCloudinaryClient();
      const [resourceType, ...rest] = ref.split(":");
      const publicId = rest.join(":");
      if (!publicId) return;
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as CloudinaryResourceType,
      });
    },
  };
}
