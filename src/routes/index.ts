import { Router } from 'express';

import type { IAssetController } from '@/controllers/AssetController';
import type { IAuthController } from '@/controllers/AuthController';
import type { IReportController } from '@/controllers/ReportController';
import type { ITenantController } from '@/controllers/TenantController';
import type { IUserController } from '@/controllers/UserController';

import { requireAuth } from '@/middleware/auth';

import createAssetRouter from './asset.routes';
import createAuthRouter from './auth.routes';
import createReportRouter from './report.routes';
import createTenantRouter from './tenant.routes';
import createUserRouter from './user.routes';

export interface RouteDependencies {
	assetController: IAssetController;
	authController: IAuthController;
	reportController: IReportController;
	tenantController: ITenantController;
	userController: IUserController;
}

export default function createRoutes(dependencies: RouteDependencies): Router {
	const { assetController, authController, reportController, tenantController, userController } = dependencies;
	const router = Router();

	router.use('/auth', createAuthRouter(authController));
	router.post('/tenants', tenantController.createTenant.bind(tenantController));

	const protectedRouter = Router();
	protectedRouter.use(requireAuth);
	protectedRouter.use('/assets', createAssetRouter(assetController));
	protectedRouter.use('/reporting', createReportRouter(reportController));
	protectedRouter.use('/tenants', createTenantRouter(tenantController));
	protectedRouter.use('/users', createUserRouter(userController));

	router.use(protectedRouter);

	return router;
}
