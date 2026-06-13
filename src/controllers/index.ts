import type { IAssetService } from '@/services/AssetService';
import type { IAuthService } from '@/services/AuthService';
import type { IReportService } from '@/services/ReportService';
import type { ITenantService } from '@/services/TenantService';
import type { IUserService } from '@/services/UserService';

import { AssetController, type IAssetController } from './AssetController';
import { AuthController, type IAuthController } from './AuthController';
import { type IReportController, ReportController } from './ReportController';
import { type ITenantController, TenantController } from './TenantController';
import { type IUserController, UserController } from './UserController';

export interface ControllerDependencies {
	assetService: IAssetService;
	authService: IAuthService;
	reportService: IReportService;
	tenantService: ITenantService;
	userService: IUserService;
}

export interface Controllers {
	assetController: IAssetController;
	authController: IAuthController;
	reportController: IReportController;
	tenantController: ITenantController;
	userController: IUserController;
}

export default function createControllers(dependencies: ControllerDependencies): Controllers {
	const { assetService, authService, reportService, tenantService, userService } = dependencies;
	return {
		assetController: new AssetController(assetService),
		authController: new AuthController(authService),
		reportController: new ReportController(reportService),
		tenantController: new TenantController(tenantService),
		userController: new UserController(userService),
	};
}
