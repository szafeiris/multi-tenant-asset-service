import type { CreateAssetDto, UpdateAssetDto } from '@/models/Asset';

import { getTenantContext } from '@/lib/context/requestContext';
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

	public async findAll(filters: { status?: string; type?: string } = {}, page = 1, limit = 10): Promise<{ data: IAsset[]; total: number }> {
		const { tenantId } = getTenantContext();
		const query: Record<string, unknown> = { tenant_id: tenantId };
		if (filters.status) query.status = filters.status;
		if (filters.type) query.type = filters.type;

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([Asset.find(query).skip(skip).limit(limit).exec(), Asset.countDocuments(query).exec()]);

		return { data, total };
	}

	public async findById(id: string): Promise<IAsset | null> {
		const { tenantId } = getTenantContext();
		return Asset.findOne({ id, tenant_id: tenantId }).exec();
	}

	public async getAssetsInBoundingBox(minLat: number, maxLat: number, minLng: number, maxLng: number): Promise<IAsset[]> {
		const { tenantId } = getTenantContext();
		return Asset.find({
			lat: { $gte: minLat, $lte: maxLat },
			lng: { $gte: minLng, $lte: maxLng },
			tenant_id: tenantId,
		}).exec();
	}

	public async getReportByStatus(): Promise<{ _id: string; count: number }[]> {
		const { tenantId } = getTenantContext();
		return Asset.aggregate([{ $match: { tenant_id: tenantId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]).exec() as Promise<{ _id: string; count: number }[]>;
	}

	public async getReportByType(): Promise<{ _id: string; count: number }[]> {
		const { tenantId } = getTenantContext();
		return Asset.aggregate([{ $match: { tenant_id: tenantId } }, { $group: { _id: '$type', count: { $sum: 1 } } }]).exec() as Promise<{ _id: string; count: number }[]>;
	}

	public async getReportByYear(year: number): Promise<{ byStatus: { _id: string; count: number }[]; byType: { _id: string; count: number }[] }> {
		const { tenantId } = getTenantContext();
		const startDate = new Date(`${year.toString()}-01-01T00:00:00.000Z`);
		const endDate = new Date(`${(year + 1).toString()}-01-01T00:00:00.000Z`);

		const result = await Asset.aggregate([
			{
				$match: {
					installed_at: { $gte: startDate, $lt: endDate },
					tenant_id: tenantId,
				},
			},
			{
				$facet: {
					byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
					byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
				},
			},
		]).exec();

		return result[0] as { byStatus: { _id: string; count: number }[]; byType: { _id: string; count: number }[] };
	}

	public async updateAsset(id: string, data: UpdateAssetDto): Promise<IAsset | null> {
		const { tenantId } = getTenantContext();
		return Asset.findOneAndUpdate({ id, tenant_id: tenantId }, data, { new: true }).exec();
	}
}
