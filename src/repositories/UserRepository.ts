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

	public async findAll(tenantId?: string) {
		return prisma.user.findMany({
			where: tenantId ? { tenantId } : undefined,
		});
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
		const { password, ...userData } = data;
		const updateData: Record<string, unknown> = { ...userData };
		if (password) {
			updateData.passwordHash = await bcrypt.hash(password, 10);
		}
		return prisma.user.update({ data: updateData, where: { id } });
	}
}
