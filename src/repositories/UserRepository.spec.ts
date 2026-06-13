/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/database/prisma';

import { UserRepository } from './UserRepository';

vi.mock('@/lib/database/prisma', () => ({
	prisma: {
		user: {
			create: vi.fn(),
			delete: vi.fn(),
			findMany: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock('bcrypt', () => ({
	default: {
		hash: vi.fn(),
	},
}));

vi.mock('node:crypto', () => ({
	default: {
		randomUUID: vi.fn(),
	},
}));

describe('UserRepository', () => {
	let repository: UserRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new UserRepository();
	});

	describe('create', () => {
		it('should hash the password and create a user', async () => {
			const mockData = { email: 'test@example.com', name: 'Test', password: 'password123', role: 'ADMIN', tenantId: 'tenant-1' };
			const mockHash = 'hashedPassword';
			const mockUUID = 'uuid-1234';

			vi.mocked(bcrypt.hash).mockResolvedValue(mockHash as never);
			vi.mocked(crypto.randomUUID).mockReturnValue(mockUUID as never);
			vi.mocked(prisma.user.create).mockResolvedValue({ ...mockData, id: mockUUID, passwordHash: mockHash } as any);

			const result = await repository.create(mockData);

			expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
			expect(crypto.randomUUID).toHaveBeenCalled();
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					email: 'test@example.com',
					id: mockUUID,
					name: 'Test',
					passwordHash: mockHash,
					role: 'ADMIN',
					tenantId: 'tenant-1',
				},
			});
			expect(result.id).toBe(mockUUID);
		});

		it('should throw an error if prisma create fails', async () => {
			const mockData = { email: 'test@example.com', name: 'Test', password: 'password123', role: 'ADMIN', tenantId: 'tenant-1' };
			vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never);
			vi.mocked(prisma.user.create).mockRejectedValue(new Error('Unique constraint failed'));

			await expect(repository.create(mockData)).rejects.toThrow('Unique constraint failed');
		});
	});

	describe('delete', () => {
		it('should delete a user by id', async () => {
			vi.mocked(prisma.user.delete).mockResolvedValue({ id: '123' } as any);
			await repository.delete('123');
			expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '123' } });
		});

		it('should throw if delete fails', async () => {
			vi.mocked(prisma.user.delete).mockRejectedValue(new Error('Record not found'));
			await expect(repository.delete('999')).rejects.toThrow('Record not found');
		});
	});

	describe('findAll', () => {
		it('should find all users for a tenant', async () => {
			vi.mocked(prisma.user.findMany).mockResolvedValue([]);
			await repository.findAll('tenant-1');
			expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
		});

		it('should find all users across tenants if no tenantId provided', async () => {
			vi.mocked(prisma.user.findMany).mockResolvedValue([]);
			await repository.findAll();
			expect(prisma.user.findMany).toHaveBeenCalledWith({ where: undefined });
		});
	});

	describe('findById', () => {
		it('should find a user by id', async () => {
			vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '123' } as any);
			await repository.findById('123');
			expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '123' } });
		});
	});

	describe('update', () => {
		it('should update a user', async () => {
			const updateData = { role: 'USER' };
			vi.mocked(prisma.user.update).mockResolvedValue({ id: '123', role: 'USER' } as any);
			await repository.update('123', updateData);
			expect(prisma.user.update).toHaveBeenCalledWith({ data: updateData, where: { id: '123' } });
		});

		it('should throw if update fails', async () => {
			vi.mocked(prisma.user.update).mockRejectedValue(new Error('Record to update not found'));
			await expect(repository.update('999', { role: 'USER' })).rejects.toThrow('Record to update not found');
		});
	});
});
