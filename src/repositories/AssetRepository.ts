import type { CreateAssetDto, UpdateAssetDto } from '@/models/Asset';

import { getTenantContext } from '@/lib/context/tenantContext';
import { Asset, type IAsset } from '@/models/Asset';

export class AssetRepository {
	public async createAsset(data: CreateAssetDto): Promise<IAsset> {
		const { tenantId } = getTenantContext();
		const asset = new Asset({ ...data, tenant_id: tenantId });
		return asset.save();
	}

	public async deleteAsset(id: string): Promise<IAsset | null> {
		const { tenantId } = getTenantContext();
		return Asset.findOneAndDelete({ id, tenant_id: tenantId }).exec();
	}

	public async findAll(): Promise<IAsset[]> {
		const { tenantId } = getTenantContext();
		return Asset.find({ tenant_id: tenantId }).exec();
	}

	public async findById(id: string): Promise<IAsset | null> {
		const { tenantId } = getTenantContext();
		return Asset.findOne({ id, tenant_id: tenantId }).exec();
	}

	public async updateAsset(id: string, data: UpdateAssetDto): Promise<IAsset | null> {
		const { tenantId } = getTenantContext();
		return Asset.findOneAndUpdate({ id, tenant_id: tenantId }, data, { new: true }).exec();
	}
}
