/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

import { AssetRepository } from '@/repositories/AssetRepository';

import { AssetService } from './AssetService';

vi.mock('@/repositories/AssetRepository');

describe('AssetService', () => {
	let service: AssetService;
	let assetRepository: Mocked<AssetRepository>;

	beforeEach(() => {
		vi.clearAllMocks();

		assetRepository = new AssetRepository() as Mocked<AssetRepository>;
		service = new AssetService(assetRepository);
	});

	describe('createAsset', () => {
		it('should create an asset via repository', async () => {
			const mockData = { id: 'asset-1', lat: 10, lng: 20, name: 'Test Asset', status: 'ACTIVE', type: 'SENSOR' };
			const createdAsset = { _id: 'mongo-id', tenant_id: 'tenant-1', ...mockData };

			assetRepository.createAsset.mockResolvedValue(createdAsset as any);

			const result = await service.createAsset(mockData as any);

			expect(assetRepository.createAsset).toHaveBeenCalledWith(mockData);
			expect(result).toEqual(createdAsset);
		});

		it('should throw if repository create fails', async () => {
			assetRepository.createAsset.mockRejectedValue(new Error('Create failed'));
			await expect(service.createAsset({} as any)).rejects.toThrow('Create failed');
		});
	});

	describe('deleteAsset', () => {
		it('should delete an asset via repository', async () => {
			const existingAsset = { _id: 'mongo-id', id: 'asset-1' };
			assetRepository.deleteAsset.mockResolvedValue(existingAsset as any);

			const result = await service.deleteAsset('asset-1');

			expect(assetRepository.deleteAsset).toHaveBeenCalledWith('asset-1');
			expect(result).toEqual(existingAsset);
		});

		it('should throw if delete fails', async () => {
			assetRepository.deleteAsset.mockRejectedValue(new Error('Delete failed'));
			await expect(service.deleteAsset('asset-1')).rejects.toThrow('Delete failed');
		});
	});

	describe('getAssetById', () => {
		it('should fetch an asset via repository', async () => {
			const existingAsset = { _id: 'mongo-id', id: 'asset-1' };
			assetRepository.findById.mockResolvedValue(existingAsset as any);

			const result = await service.getAssetById('asset-1');
			expect(assetRepository.findById).toHaveBeenCalledWith('asset-1');
			expect(result).toEqual(existingAsset);
		});

		it('should return null if asset not found', async () => {
			assetRepository.findById.mockResolvedValue(null);
			const result = await service.getAssetById('asset-1');
			expect(result).toBeNull();
		});
	});

	describe('getAssets', () => {
		it('should fetch all assets via repository', async () => {
			const assets = [{ id: 'asset-1' }];
			assetRepository.findAll.mockResolvedValue(assets as any);

			const result = await service.getAssets();
			expect(assetRepository.findAll).toHaveBeenCalled();
			expect(result).toEqual(assets);
		});
	});

	describe('updateAsset', () => {
		it('should update an asset via repository', async () => {
			const updatedAsset = { id: 'asset-1', name: 'Updated Name' };
			assetRepository.updateAsset.mockResolvedValue(updatedAsset as any);

			const result = await service.updateAsset('asset-1', { name: 'Updated Name' });

			expect(assetRepository.updateAsset).toHaveBeenCalledWith('asset-1', { name: 'Updated Name' });
			expect(result).toEqual(updatedAsset);
		});

		it('should return null if asset not found on update', async () => {
			assetRepository.updateAsset.mockResolvedValue(null);
			const result = await service.updateAsset('asset-1', { name: 'Updated Name' });
			expect(result).toBeNull();
		});

		it('should throw if update fails', async () => {
			assetRepository.updateAsset.mockRejectedValue(new Error('Update failed'));
			await expect(service.updateAsset('asset-1', { name: 'Updated Name' })).rejects.toThrow('Update failed');
		});
	});
});
