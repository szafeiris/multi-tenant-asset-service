import type { IAssetService } from '@/services/AssetService';
import type { IAuthService } from '@/services/AuthService';
import type { ITenantService } from '@/services/TenantService';
import type { IUserService } from '@/services/UserService';

import { AssetController, type IAssetController } from './AssetController';
import { AuthController, type IAuthController } from './AuthController';
import { type ITenantController, TenantController } from './TenantController';
import { type IUserController, UserController } from './UserController';

export interface ControllerDependencies {
	assetService: IAssetService;
	authService: IAuthService;
	tenantService: ITenantService;
	userService: IUserService;
}

export interface Controllers {
	assetController: IAssetController;
	authController: IAuthController;
	tenantController: ITenantController;
	userController: IUserController;
}

export default function createControllers(dependencies: ControllerDependencies): Controllers {
	const { assetService, authService, tenantService, userService } = dependencies;
	return {
		assetController: new AssetController(assetService),
		authController: new AuthController(authService),
		tenantController: new TenantController(tenantService),
		userController: new UserController(userService),
	};
}
