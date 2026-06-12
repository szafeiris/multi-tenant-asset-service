import { AssetRepository } from './AssetRepository';
import { TenantRepository } from './TenantRepository';
import { UserRepository } from './UserRepository';

export interface Repositories {
	assetRepository: AssetRepository;
	tenantRepository: TenantRepository;
	userRepository: UserRepository;
}

export const createRepositories = (): Repositories => {
	return {
		assetRepository: new AssetRepository(),
		tenantRepository: new TenantRepository(),
		userRepository: new UserRepository(),
	};
};
