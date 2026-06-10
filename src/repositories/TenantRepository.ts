import crypto from 'node:crypto';

import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';

import { prisma } from '@/lib/database/prisma';

export class TenantRepository {
	public async create(data: CreateTenantDto) {
		return prisma.tenant.create({ data: { ...data, id: crypto.randomUUID() } });
	}

	public async delete(id: string) {
		return prisma.tenant.delete({ where: { id } });
	}

	public async findAll() {
		return prisma.tenant.findMany();
	}

	public async findById(id: string) {
		return prisma.tenant.findUnique({ where: { id } });
	}

	public async findBySlug(slug: string) {
		return prisma.tenant.findUnique({ where: { slug } });
	}

	public async update(id: string, data: UpdateTenantDto) {
		return prisma.tenant.update({ data, where: { id } });
	}
}
