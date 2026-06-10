import crypto from 'node:crypto';

import type { CreateUserDto, UpdateUserDto } from '@/models/User';

import { prisma } from '@/lib/database/prisma';

export class UserRepository {
	public async create(data: CreateUserDto) {
		return prisma.user.create({ data: { ...data, id: crypto.randomUUID() } });
	}

	public async delete(id: string) {
		return prisma.user.delete({ where: { id } });
	}

	public async findAll(tenantId?: string) {
		return prisma.user.findMany({
			where: tenantId ? { tenantId } : undefined,
		});
	}

	public async findById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	}

	public async update(id: string, data: UpdateUserDto) {
		return prisma.user.update({ data, where: { id } });
	}
}
