export interface OryCMSStorageUploadInput {
  buffer: Buffer;
  /** Original filename, used for extension/display only - storage keys are generated. */
  filename: string;
  mimeType: string;
}

export interface OryCMSStorageUploadResult {
  /** Publicly reachable URL for the stored file. */
  url: string;
  /**
   * Opaque reference the adapter needs to delete this file later (a local
   * file path, a Cloudinary "resourceType:publicId" pair, etc). Never parsed
   * outside the adapter that produced it.
   */
  ref: string;
}

export interface OryCMSStorageAdapter {
  readonly name: "local" | "cloudinary" | "s3" | "custom";
  upload(input: OryCMSStorageUploadInput): Promise<OryCMSStorageUploadResult>;
  delete(ref: string): Promise<void>;
}
