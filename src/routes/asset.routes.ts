import { Router } from 'express';

import type { IAssetController } from '@/controllers/AssetController';

import { hasRole } from '@/middleware/rbac';

export default function createAssetRouter(assetController: IAssetController) {
	const assetRouter = Router();

	assetRouter.post('/', hasRole(['admin', 'editor']), assetController.createAsset.bind(assetController));
	assetRouter.get('/', hasRole(['admin', 'editor', 'viewer']), assetController.getAssets.bind(assetController));
	assetRouter.get('/:id', hasRole(['admin', 'editor', 'viewer']), assetController.getAssetById.bind(assetController));
	assetRouter.put('/:id', hasRole(['admin', 'editor']), assetController.updateAsset.bind(assetController));
	assetRouter.delete('/:id', hasRole(['admin', 'editor']), assetController.deleteAsset.bind(assetController));

	return assetRouter;
}
