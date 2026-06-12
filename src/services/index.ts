import type { AssetRepository } from '@/repositories/AssetRepository';
import type { TenantRepository } from '@/repositories/TenantRepository';
import type { UserRepository } from '@/repositories/UserRepository';

import { AssetService } from './AssetService';
import { TenantService } from './TenantService';
import { UserService } from './UserService';

export interface Repositories {
	assetRepository: AssetRepository;
	tenantRepository: TenantRepository;
	userRepository: UserRepository;
}

export function createServices(repositories: Repositories) {
	return {
		assetService: new AssetService(repositories.assetRepository),
		tenantService: new TenantService(repositories.tenantRepository),
		userService: new UserService(repositories.userRepository),
	};
}
