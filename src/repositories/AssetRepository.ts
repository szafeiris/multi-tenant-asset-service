import type { CreateAssetDto, UpdateAssetDto } from '@/models/Asset';

import { Asset, type IAsset } from '@/models/Asset';

export class AssetRepository {
	public async create(data: CreateAssetDto): Promise<IAsset> {
		const asset = new Asset(data);
		return asset.save();
	}

	public async delete(id: string): Promise<IAsset | null> {
		return Asset.findOneAndDelete({ id }).exec();
	}

	public async findAll(tenantId?: string): Promise<IAsset[]> {
		const query = tenantId ? { tenant_id: tenantId } : {};
		return Asset.find(query).exec();
	}

	public async findById(id: string): Promise<IAsset | null> {
		return Asset.findOne({ id }).exec();
	}

	public async update(id: string, data: UpdateAssetDto): Promise<IAsset | null> {
		return Asset.findOneAndUpdate({ id }, data, { new: true }).exec();
	}
}
