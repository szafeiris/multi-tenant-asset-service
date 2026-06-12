import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';
import { TenantRepository } from '@/repositories/TenantRepository';

export class TenantService {
	private readonly tenantRepository: TenantRepository;

	constructor(tenantRepository: TenantRepository) {
		this.tenantRepository = tenantRepository;
	}

	public async createTenant(data: CreateTenantDto) {
		return this.tenantRepository.create(data);
	}

	public async deleteTenant(id: string) {
		return this.tenantRepository.delete(id);
	}

	public async getTenantById(id: string) {
		return this.tenantRepository.findById(id);
	}

	public async getTenantBySlug(slug: string) {
		return this.tenantRepository.findBySlug(slug);
	}

	public async getTenants() {
		return this.tenantRepository.findAll();
	}

	public async updateTenant(id: string, data: UpdateTenantDto) {
		return this.tenantRepository.update(id, data);
	}
}
