import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

import type { CreateTenantDto, UpdateTenantDto } from '@/models/Tenant';

import { prisma } from '@/lib/database/prisma';

export class TenantRepository {
	public async create(data: CreateTenantDto) {
		const { adminUser, ...tenantData } = data;
		const passwordHash = await bcrypt.hash(adminUser.password, 10);

		return prisma.tenant.create({
			data: {
				...tenantData,
				id: crypto.randomUUID(),
				users: {
					create: {
						email: adminUser.email,
						id: crypto.randomUUID(),
						name: adminUser.name,
						passwordHash,
						role: 'admin',
					},
				},
			},
		});
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
