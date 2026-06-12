import { Router } from 'express';

import type { IAssetController } from '@/controllers/AssetController';

export default function createAssetRouter(assetController: IAssetController) {
	const assetRouter = Router();

	assetRouter.post('/', assetController.createAsset.bind(assetController));
	assetRouter.get('/', assetController.getAssets.bind(assetController));
	assetRouter.get('/:id', assetController.getAssetById.bind(assetController));
	assetRouter.put('/:id', assetController.updateAsset.bind(assetController));
	assetRouter.delete('/:id', assetController.deleteAsset.bind(assetController));

	return assetRouter;
}
