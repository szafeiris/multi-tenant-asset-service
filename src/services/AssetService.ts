import type { CreateAssetDto, IAsset, UpdateAssetDto } from '@/models/Asset';

import { AssetRepository } from '@/repositories/AssetRepository';

export interface IAssetService {
	createAsset(data: CreateAssetDto): Promise<IAsset>;
	deleteAsset(id: string): Promise<IAsset | null>;
	getAssetById(id: string): Promise<IAsset | null>;
	getAssets(filters?: { status?: string; type?: string }, page?: number, limit?: number): Promise<{ data: IAsset[]; total: number }>;
	updateAsset(id: string, data: UpdateAssetDto): Promise<IAsset | null>;
}

export class AssetService implements IAssetService {
	private readonly assetRepository: AssetRepository;

	constructor(assetRepository: AssetRepository) {
		this.assetRepository = assetRepository;
	}

	public async createAsset(data: CreateAssetDto): Promise<IAsset> {
		// Notice how there is no tenantId passed. The repository layer will handle it.
		return this.assetRepository.createAsset(data);
	}

	public async deleteAsset(id: string): Promise<IAsset | null> {
		return this.assetRepository.deleteAsset(id);
	}

	public async getAssetById(id: string): Promise<IAsset | null> {
		return this.assetRepository.findById(id);
	}

	public async getAssets(filters?: { status?: string; type?: string }, page?: number, limit?: number): Promise<{ data: IAsset[]; total: number }> {
		return this.assetRepository.findAll(filters, page, limit);
	}

	public async updateAsset(id: string, data: UpdateAssetDto): Promise<IAsset | null> {
		return this.assetRepository.updateAsset(id, data);
	}
}
