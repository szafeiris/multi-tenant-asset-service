import type { Tenant } from '@prisma/client';

import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';

import { getRequestContext, getTenantContext } from '@/lib/context/requestContext';
import { getAuditLogger } from '@/lib/logging/logger';
import { TenantRepository } from '@/repositories/TenantRepository';

export interface ITenantService {
	createTenant(data: CreateTenantDto): Promise<Tenant>;
	deleteTenant(id: string): Promise<Tenant>;
	getTenantById(id: string): Promise<null | Tenant>;
	getTenantBySlug(slug: string): Promise<null | Tenant>;

	updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant>;
}

export class TenantService implements ITenantService {
	private readonly tenantRepository: TenantRepository;

	constructor(tenantRepository: TenantRepository) {
		this.tenantRepository = tenantRepository;
	}

	public async createTenant(data: CreateTenantDto) {
		const tenant = await this.tenantRepository.create(data);
		const context = getRequestContext();
		getAuditLogger().info(`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: tenant [${tenant.id}], action: created`);
		return tenant;
	}

	public async deleteTenant(id: string) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) throw new Error('Tenant not found or access denied');
		const tenant = await this.tenantRepository.delete(id);
		const context = getRequestContext();
		getAuditLogger().info(`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: tenant [${tenant.id}], action: deleted`);
		return tenant;
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

	public async updateTenant(id: string, data: UpdateTenantDto) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) throw new Error('Tenant not found or access denied');
		return this.tenantRepository.update(id, data);
	}
}
