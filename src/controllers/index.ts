import type { AssetService } from '@/services/AssetService';
import type { TenantService } from '@/services/TenantService';
import type { UserService } from '@/services/UserService';

import { AssetController } from './AssetController';
import { TenantController } from './TenantController';
import { UserController } from './UserController';

export interface Services {
	assetService: AssetService;
	tenantService: TenantService;
	userService: UserService;
}

export function createControllers(services: Services) {
	return {
		assetController: new AssetController(services.assetService),
		tenantController: new TenantController(services.tenantService),
		userController: new UserController(services.userService),
	};
}
