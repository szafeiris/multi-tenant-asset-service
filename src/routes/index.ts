import { Router } from 'express';

import { IAssetController } from '@/controllers/asset.controller';
import { ITenantController } from '@/controllers/tenant.controller';
import { IUserController } from '@/controllers/user.controller';

import createAssetRouter from './asset.routes';
import createTenantRouter from './tenant.routes';
import createUserRouter from './user.routes';

export interface RouteDependencies {
	assetController: IAssetController;
	tenantController: ITenantController;
	userController: IUserController;
}

export default function createRoutes(dependencies: RouteDependencies): Router {
	const { assetController, tenantController, userController } = dependencies;
	const router = Router();

	router.use('/assets', createAssetRouter(assetController));
	router.use('/tenants', createTenantRouter(tenantController));
	router.use('/users', createUserRouter(userController));

	return router;
}
