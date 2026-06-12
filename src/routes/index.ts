import { Router } from 'express';

import type { IAssetController } from '@/controllers/AssetController';
import type { IAuthController } from '@/controllers/AuthController';
import type { ITenantController } from '@/controllers/TenantController';
import type { IUserController } from '@/controllers/UserController';

import { requireAuth } from '@/middleware/auth';

import createAssetRouter from './asset.routes';
import createAuthRouter from './auth.routes';
import createTenantRouter from './tenant.routes';
import createUserRouter from './user.routes';

export interface RouteDependencies {
	assetController: IAssetController;
	authController: IAuthController;
	tenantController: ITenantController;
	userController: IUserController;
}

export default function createRoutes(dependencies: RouteDependencies): Router {
	const { assetController, authController, tenantController, userController } = dependencies;
	const router = Router();

	router.use('/auth', createAuthRouter(authController));

	const protectedRouter = Router();
	protectedRouter.use(requireAuth);
	protectedRouter.use('/assets', createAssetRouter(assetController));
	protectedRouter.use('/tenants', createTenantRouter(tenantController));
	protectedRouter.use('/users', createUserRouter(userController));

	router.use(protectedRouter);

	return router;
}
