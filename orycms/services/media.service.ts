import type {
  OryCMSMediaAsset,
  OryCMSUpdateMediaAssetInput,
  OryCMSPaginatedResponse,
  OryCMSPaginationParams,
} from "@/types";

export const OryCMSMediaService = {
  async findAll(
    _params?: OryCMSPaginationParams & { type?: string; search?: string },
  ): Promise<OryCMSPaginatedResponse<OryCMSMediaAsset>> {
    throw new Error("Not implemented");
  },

  async findById(_id: string): Promise<OryCMSMediaAsset> {
    throw new Error("Not implemented");
  },

  async upload(_file: File): Promise<OryCMSMediaAsset> {
    throw new Error("Not implemented");
  },

  async update(_id: string, _input: OryCMSUpdateMediaAssetInput): Promise<OryCMSMediaAsset> {
    throw new Error("Not implemented");
  },

  async delete(_id: string): Promise<void> {
    throw new Error("Not implemented");
  },

  async bulkDelete(_ids: string[]): Promise<void> {
    throw new Error("Not implemented");
  },
};
