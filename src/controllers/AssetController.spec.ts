/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { IAssetService } from '@/services/AssetService';

import { AssetController } from './AssetController';

describe('AssetController', () => {
	let controller: AssetController;
	let assetService: Mocked<IAssetService>;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let json: Mock;
	let send: Mock;
	let status: Mock;

	beforeEach(() => {
		vi.clearAllMocks();

		assetService = {
			createAsset: vi.fn(),
			deleteAsset: vi.fn(),
			getAssetById: vi.fn(),
			getAssets: vi.fn(),
			updateAsset: vi.fn(),
		};

		controller = new AssetController(assetService);

		json = vi.fn();
		send = vi.fn();
		status = vi.fn().mockReturnValue({ json, send });

		req = {
			body: {},
			params: {},
			query: {},
		};
		res = {
			status,
		} as any;
	});

	describe('createAsset', () => {
		it('should create an asset and return 201', async () => {
			req.body = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				installed_at: '2023-01-01',
				lat: 10,
				lng: 20,
				name: 'Asset',
				status: 'ACTIVE',
				tenant_id: '123e4567-e89b-12d3-a456-426614174000',
				type: 'SENSOR',
			};
			assetService.createAsset.mockResolvedValue({ id: 'asset-1' } as any);

			await controller.createAsset(req as Request, res as Response);

			expect(assetService.createAsset).toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(201);
			expect(json).toHaveBeenCalledWith({ id: 'asset-1' });
		});

		it('should return 400 on validation failure', async () => {
			req.body = { name: 'Asset' }; // Missing required fields

			await controller.createAsset(req as Request, res as Response);

			expect(assetService.createAsset).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.stringContaining('Invalid'),
				}),
			);
		});
	});

	describe('deleteAsset', () => {
		it('should delete an asset and return 204', async () => {
			req.params = { id: 'asset-1' };
			assetService.deleteAsset.mockResolvedValue({ id: 'asset-1' } as any);

			await controller.deleteAsset(req as Request, res as Response);

			expect(assetService.deleteAsset).toHaveBeenCalledWith('asset-1');
			expect(status).toHaveBeenCalledWith(204);
			expect(send).toHaveBeenCalled();
		});

		it('should return 404 if asset not found for deletion', async () => {
			req.params = { id: 'asset-1' };
			assetService.deleteAsset.mockResolvedValue(null);

			await controller.deleteAsset(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(404);
		});
	});

	describe('getAssetById', () => {
		it('should return the asset with 200', async () => {
			req.params = { id: 'asset-1' };
			assetService.getAssetById.mockResolvedValue({ id: 'asset-1' } as any);

			await controller.getAssetById(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith({ id: 'asset-1' });
		});

		it('should return 404 if asset not found', async () => {
			req.params = { id: 'asset-1' };
			assetService.getAssetById.mockResolvedValue(null);

			await controller.getAssetById(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(404);
		});
	});

	describe('getAssets', () => {
		it('should return list of assets with 200', async () => {
			const mockResult = { data: [{ id: 'asset-1' } as any], limit: 10, page: 1, total: 1 };
			assetService.getAssets.mockResolvedValue(mockResult);

			await controller.getAssets(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith(mockResult);
		});
	});

	describe('updateAsset', () => {
		it('should update asset and return 200', async () => {
			req.params = { id: 'asset-1' };
			req.body = { name: 'Updated' };
			assetService.updateAsset.mockResolvedValue({ id: 'asset-1', name: 'Updated' } as any);

			await controller.updateAsset(req as Request, res as Response);

			expect(assetService.updateAsset).toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(200);
		});

		it('should return 404 if asset to update not found', async () => {
			req.params = { id: 'asset-1' };
			req.body = { name: 'Updated' };
			assetService.updateAsset.mockResolvedValue(null);

			await controller.updateAsset(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(404);
		});
	});
});
