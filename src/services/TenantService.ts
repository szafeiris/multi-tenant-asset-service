import type { Tenant } from '@prisma/client';

import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';

import { getRequestContext, getTenantContext } from '@/lib/context/requestContext';
import { getAuditLogger } from '@/lib/logging/logger';
import { redis } from '@/lib/redis';
import { Cacheable } from '@/lib/redis/cache';
import { TenantRepository } from '@/repositories/TenantRepository';

export interface ITenantService {
	createTenant(data: CreateTenantDto): Promise<Tenant>;
	deleteTenant(id: string): Promise<Tenant>;
	getTenantById(id: string): Promise<null | Tenant>;
	getTenantBySlug(slug: string): Promise<null | Tenant>;

	updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant>;
	warmupCache(): Promise<void>;
}

export class TenantService implements ITenantService {
	private readonly tenantRepository: TenantRepository;

	constructor(tenantRepository: TenantRepository) {
		this.tenantRepository = tenantRepository;
	}

	public async createTenant(data: CreateTenantDto) {
		const tenant = await this.tenantRepository.create(data);
		await redis.set(`tenant:slug:${tenant.slug}`, JSON.stringify(tenant));

		const context = getRequestContext();
		getAuditLogger().info(`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: tenant [${tenant.id}], action: created`);
		return tenant;
	}

	public async deleteTenant(id: string) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) throw new Error('Tenant not found or access denied');
		const tenant = await this.tenantRepository.delete(id);
		await redis.del(`tenant:slug:${tenant.slug}`);
		const context = getRequestContext();
		getAuditLogger().info(`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: tenant [${tenant.id}], action: deleted`);
		return tenant;
	}

	public async getTenantById(id: string) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) return null;
		return this.tenantRepository.findById(id);
	}

	@Cacheable({ key: ([slug]: [string]) => `tenant:slug:${slug}` })
	public async getTenantBySlug(slug: string) {
		const { tenantId } = getTenantContext();
		const tenant = await this.tenantRepository.findBySlug(slug);
		if (tenant && tenant.id !== tenantId) return null;
		return tenant;
	}

	public async updateTenant(id: string, data: UpdateTenantDto) {
		const { tenantId } = getTenantContext();
		if (id !== tenantId) throw new Error('Tenant not found or access denied');

		const oldTenant = await this.tenantRepository.findById(id);
		const updatedTenant = await this.tenantRepository.update(id, data);

		if (oldTenant && oldTenant.slug !== updatedTenant.slug) {
			await redis.del(`tenant:slug:${oldTenant.slug}`);
		}

		await redis.set(`tenant:slug:${updatedTenant.slug}`, JSON.stringify(updatedTenant));

		return updatedTenant;
	}

	public async warmupCache() {
		const tenants = await this.tenantRepository.findAll();
		const pipeline = redis.pipeline();
		for (const tenant of tenants) {
			pipeline.set(`tenant:slug:${tenant.slug}`, JSON.stringify(tenant));
		}
		await pipeline.exec();
	}
}
