/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTenantContext } from '@/lib/context/requestContext';
import { Asset } from '@/models/Asset';

import { AssetRepository } from './AssetRepository';

vi.mock('@/lib/context/requestContext', () => ({
	getTenantContext: vi.fn(),
}));

vi.mock('@/models/Asset', () => {
	const MockAsset = vi.fn().mockImplementation(function (this: any, data: any) {
		Object.assign(this, data);
		this.save = vi.fn().mockResolvedValue(data);
	});
	(MockAsset as any).findOneAndDelete = vi.fn();
	(MockAsset as any).find = vi.fn();
	(MockAsset as any).findOne = vi.fn();
	(MockAsset as any).aggregate = vi.fn();
	(MockAsset as any).findOneAndUpdate = vi.fn();
	(MockAsset as any).countDocuments = vi.fn();
	return { Asset: MockAsset };
});

describe('AssetRepository', () => {
	let repository: AssetRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getTenantContext).mockReturnValue({ tenantId: 'tenant-1' } as any);
		repository = new AssetRepository();
	});

	describe('createAsset', () => {
		it('should create an asset with tenant_id from context', async () => {
			const mockData = { id: 'asset-1', lat: 10, lng: 20, name: 'Test Asset', status: 'ACTIVE', type: 'SENSOR' };
			const result = await repository.createAsset(mockData as any);

			expect(getTenantContext).toHaveBeenCalled();
			expect(Asset).toHaveBeenCalledWith({ ...mockData, tenant_id: 'tenant-1' });
			expect(result.tenant_id).toBe('tenant-1');
		});

		it('should throw an error if save fails', async () => {
			vi.mocked(Asset).mockImplementationOnce(
				() =>
					({
						save: vi.fn().mockRejectedValue(new Error('Validation failed')),
					}) as any,
			);

			await expect(repository.createAsset({} as any)).rejects.toThrow('Validation failed');
		});
	});

	describe('deleteAsset', () => {
		it('should delete an asset by id and tenant_id', async () => {
			const mockExec = vi.fn().mockResolvedValue({ id: 'asset-1' });
			vi.mocked(Asset.findOneAndDelete).mockReturnValue({ exec: mockExec } as any);

			await repository.deleteAsset('asset-1');
			expect(Asset.findOneAndDelete).toHaveBeenCalledWith({ id: 'asset-1', tenant_id: 'tenant-1' });
			expect(mockExec).toHaveBeenCalled();
		});

		it('should throw if deletion fails', async () => {
			const mockExec = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(Asset.findOneAndDelete).mockReturnValue({ exec: mockExec } as any);

			await expect(repository.deleteAsset('asset-1')).rejects.toThrow('DB Error');
		});
	});

	describe('findAll', () => {
		it('should find all assets for the current tenant with default pagination', async () => {
			const mockExecFind = vi.fn().mockResolvedValue([]);
			const mockLimit = vi.fn().mockReturnValue({ exec: mockExecFind });
			const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
			vi.mocked(Asset.find).mockReturnValue({ skip: mockSkip } as any);

			const mockExecCount = vi.fn().mockResolvedValue(0);
			vi.mocked(Asset.countDocuments).mockReturnValue({ exec: mockExecCount } as any);

			const result = await repository.findAll();
			expect(Asset.find).toHaveBeenCalledWith({ tenant_id: 'tenant-1' });
			expect(mockSkip).toHaveBeenCalledWith(0);
			expect(mockLimit).toHaveBeenCalledWith(10);
			expect(Asset.countDocuments).toHaveBeenCalledWith({ tenant_id: 'tenant-1' });
			expect(result).toEqual({ data: [], total: 0 });
		});
	});

	describe('findById', () => {
		it('should find an asset by id and tenant_id', async () => {
			const mockExec = vi.fn().mockResolvedValue({ id: 'asset-1' });
			vi.mocked(Asset.findOne).mockReturnValue({ exec: mockExec } as any);

			await repository.findById('asset-1');
			expect(Asset.findOne).toHaveBeenCalledWith({ id: 'asset-1', tenant_id: 'tenant-1' });
		});
	});

	describe('getAssetsInBoundingBox', () => {
		it('should find assets within bounding box for the current tenant', async () => {
			const mockExec = vi.fn().mockResolvedValue([]);
			vi.mocked(Asset.find).mockReturnValue({ exec: mockExec } as any);

			await repository.getAssetsInBoundingBox(10, 20, 30, 40);
			expect(Asset.find).toHaveBeenCalledWith({
				lat: { $gte: 10, $lte: 20 },
				lng: { $gte: 30, $lte: 40 },
				tenant_id: 'tenant-1',
			});
		});
	});

	describe('getReportByStatus', () => {
		it('should aggregate assets by status for the current tenant', async () => {
			const mockExec = vi.fn().mockResolvedValue([]);
			vi.mocked(Asset.aggregate).mockReturnValue({ exec: mockExec } as any);

			await repository.getReportByStatus();
			expect(Asset.aggregate).toHaveBeenCalledWith([{ $match: { tenant_id: 'tenant-1' } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
		});
	});

	describe('getReportByType', () => {
		it('should aggregate assets by type for the current tenant', async () => {
			const mockExec = vi.fn().mockResolvedValue([]);
			vi.mocked(Asset.aggregate).mockReturnValue({ exec: mockExec } as any);

			await repository.getReportByType();
			expect(Asset.aggregate).toHaveBeenCalledWith([{ $match: { tenant_id: 'tenant-1' } }, { $group: { _id: '$type', count: { $sum: 1 } } }]);
		});
	});

	describe('getReportByYear', () => {
		it('should aggregate assets by year for the current tenant', async () => {
			const mockExec = vi.fn().mockResolvedValue([{ byStatus: [], byType: [] }]);
			vi.mocked(Asset.aggregate).mockReturnValue({ exec: mockExec } as any);

			await repository.getReportByYear(2023);

			const expectedMatch = {
				$match: {
					installed_at: {
						$gte: new Date('2023-01-01T00:00:00.000Z'),
						$lt: new Date('2024-01-01T00:00:00.000Z'),
					},
					tenant_id: 'tenant-1',
				},
			};
			expect(Asset.aggregate).toHaveBeenCalledWith([
				expectedMatch,
				{
					$facet: {
						byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
						byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
					},
				},
			]);
		});
	});

	describe('updateAsset', () => {
		it('should update an asset by id and tenant_id', async () => {
			const mockExec = vi.fn().mockResolvedValue({ id: 'asset-1', name: 'Updated' });
			vi.mocked(Asset.findOneAndUpdate).mockReturnValue({ exec: mockExec } as any);

			await repository.updateAsset('asset-1', { name: 'Updated' });
			expect(Asset.findOneAndUpdate).toHaveBeenCalledWith({ id: 'asset-1', tenant_id: 'tenant-1' }, { name: 'Updated' }, { new: true });
		});

		it('should throw if update fails', async () => {
			const mockExec = vi.fn().mockRejectedValue(new Error('Update failed'));
			vi.mocked(Asset.findOneAndUpdate).mockReturnValue({ exec: mockExec } as any);

			await expect(repository.updateAsset('asset-1', { name: 'Updated' })).rejects.toThrow('Update failed');
		});
	});
});
