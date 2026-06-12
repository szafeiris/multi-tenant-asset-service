import type { Request, Response } from 'express';

import { getLogger } from '@/lib/logging/logger';
import { CreateAssetSchema, UpdateAssetSchema } from '@/models/Asset';
import { AssetService } from '@/services/AssetService';

const logger = getLogger();

export class AssetController {
	private readonly assetService: AssetService;

	constructor(assetService: AssetService) {
		this.assetService = assetService;
	}

	public async createAsset(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = CreateAssetSchema.parse(req.body);
			const asset = await this.assetService.createAsset(validatedData);
			res.status(201).json(asset);
		} catch (error) {
			logger.error('Failed to create asset', { error });
			res.status(400).json({ error: 'Failed to create asset', details: error });
		}
	}

	public async deleteAsset(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const asset = await this.assetService.deleteAsset(id);

			if (!asset) {
				res.status(404).json({ error: 'Asset not found' });
				return;
			}

			res.status(204).send();
		} catch (error) {
			logger.error('Failed to delete asset', { error });
			res.status(500).json({ error: 'Failed to delete asset' });
		}
	}

	public async getAssetById(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const asset = await this.assetService.getAssetById(id);

			if (!asset) {
				res.status(404).json({ error: 'Asset not found' });
				return;
			}

			res.status(200).json(asset);
		} catch (error) {
			logger.error('Failed to fetch asset', { error });
			res.status(500).json({ error: 'Failed to fetch asset' });
		}
	}

	public async getAssets(req: Request, res: Response): Promise<void> {
		try {
			const assets = await this.assetService.getAssets();
			res.status(200).json(assets);
		} catch (error) {
			logger.error('Failed to fetch assets', { error });
			res.status(500).json({ error: 'Failed to fetch assets' });
		}
	}

	public async updateAsset(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const validatedData = UpdateAssetSchema.parse(req.body);

			const asset = await this.assetService.updateAsset(id, validatedData);

			if (!asset) {
				res.status(404).json({ error: 'Asset not found' });
				return;
			}

			res.status(200).json(asset);
		} catch (error) {
			logger.error('Failed to update asset', { error });
			res.status(400).json({ error: 'Failed to update asset', details: error });
		}
	}
}
