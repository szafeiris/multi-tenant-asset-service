import type { AssetRepository } from '@/repositories/AssetRepository';
import type { TenantRepository } from '@/repositories/TenantRepository';
import type { UserRepository } from '@/repositories/UserRepository';

import { AssetService, type IAssetService } from './AssetService';
import { AuthService, type IAuthService } from './AuthService';
import { type ITenantService, TenantService } from './TenantService';
import { type IUserService, UserService } from './UserService';

export interface ServiceDependencies {
	assetRepository: AssetRepository;
	tenantRepository: TenantRepository;
	userRepository: UserRepository;
}

export interface Services {
	assetService: IAssetService;
	authService: IAuthService;
	tenantService: ITenantService;
	userService: IUserService;
}

export default function createServices(dependencies: ServiceDependencies): Services {
	const { assetRepository, tenantRepository, userRepository } = dependencies;
	return {
		assetService: new AssetService(assetRepository),
		authService: new AuthService(tenantRepository, userRepository),
		tenantService: new TenantService(tenantRepository),
		userService: new UserService(userRepository),
	};
}
