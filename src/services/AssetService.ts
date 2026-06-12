import type { CreateAssetDto, IAsset, UpdateAssetDto } from '@/models/Asset';

import { AssetRepository } from '@/repositories/AssetRepository';

export interface IAssetService {
	createAsset(data: CreateAssetDto): Promise<IAsset>;
	deleteAsset(id: string): Promise<IAsset | null>;
	getAssetById(id: string): Promise<IAsset | null>;
	getAssets(): Promise<IAsset[]>;
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

	public async getAssets(): Promise<IAsset[]> {
		// No tenantId argument needed.
		return this.assetRepository.findAll();
	}

	public async updateAsset(id: string, data: UpdateAssetDto): Promise<IAsset | null> {
		return this.assetRepository.updateAsset(id, data);
	}
}
