import type { Tenant } from '@prisma/client';

import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';

import { getTenantContext } from '@/lib/context/requestContext';
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
		const { tenantId } = getTenantContext();
		if (id !== tenantId) throw new Error('Tenant not found or access denied');
		return this.tenantRepository.delete(id);
	}

	public async getTenantById(id: string) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) return null;
		return this.tenantRepository.findById(id);
	}

	public async getTenantBySlug(slug: string) {
		const { tenantId } = getTenantContext();
		const tenant = await this.tenantRepository.findBySlug(slug);
		if (tenant && tenant.id !== tenantId) return null;
		return tenant;
	}

	public async getTenants() {
		const { tenantId } = getTenantContext();
		const tenant = await this.tenantRepository.findById(tenantId);
		return tenant ? [tenant] : [];
	}

	public async updateTenant(id: string, data: UpdateTenantDto) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) throw new Error('Tenant not found or access denied');
		return this.tenantRepository.update(id, data);
	}
}
