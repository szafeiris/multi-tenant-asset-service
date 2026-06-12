import type { Tenant } from '@prisma/client';

import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';

import { TenantRepository } from '@/repositories/TenantRepository';

export interface ITenantService {
	createTenant(data: CreateTenantDto): Promise<Tenant>;
	deleteTenant(id: string): Promise<Tenant>;
	getTenantById(id: string): Promise<null | Tenant>;
	getTenantBySlug(slug: string): Promise<null | Tenant>;
	getTenants(): Promise<Tenant[]>;
	updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant>;
}

export class TenantService implements ITenantService {
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
