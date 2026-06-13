import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

import type { CreateUserDto, UpdateUserDto } from '@/models/User';

import { prisma } from '@/lib/database/prisma';

export class UserRepository {
	public async create(data: CreateUserDto) {
		const { password, ...userData } = data;
		const passwordHash = await bcrypt.hash(password, 10);
		return prisma.user.create({ data: { ...userData, id: crypto.randomUUID(), passwordHash } });
	}

	public async delete(id: string) {
		return prisma.user.delete({ where: { id } });
	}

	public async findAll(tenantId?: string, page = 1, limit = 10) {
		const skip = (page - 1) * limit;
		const where = tenantId ? { tenantId } : undefined;

		const [data, total] = await Promise.all([prisma.user.findMany({ skip, take: limit, where }), prisma.user.count({ where })]);

		return { data, total };
	}

	public async findByEmailAndTenant(tenantId: string, email: string) {
		return prisma.user.findUnique({
			where: {
				tenantId_email: {
					email,
					tenantId,
				},
			},
		});
	}

	public async findById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	}

	public async update(id: string, data: UpdateUserDto) {
		return prisma.user.update({ data, where: { id } });
	}
}
