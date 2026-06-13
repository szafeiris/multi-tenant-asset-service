/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/database/prisma';

import { TenantRepository } from './TenantRepository';

vi.mock('@/lib/database/prisma', () => ({
	prisma: {
		tenant: {
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

describe('TenantRepository', () => {
	let repository: TenantRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new TenantRepository();
	});

	describe('create', () => {
		it('should hash admin password and create a tenant with admin user', async () => {
			const mockData = {
				adminUser: { email: 'admin@test.com', name: 'Admin', password: 'password123' },
				name: 'Test Tenant',
				slug: 'test-tenant',
			};
			const mockHash = 'hashedPassword';
			const mockTenantUUID = 'tenant-uuid-1234';
			const mockUserUUID = 'user-uuid-5678';

			vi.mocked(bcrypt.hash).mockResolvedValue(mockHash as never);
			vi.mocked(crypto.randomUUID)
				.mockReturnValueOnce(mockTenantUUID as never)
				.mockReturnValueOnce(mockUserUUID as never);
			vi.mocked(prisma.tenant.create).mockResolvedValue({ id: mockTenantUUID, name: 'Test Tenant', slug: 'test-tenant' } as any);

			const result = await repository.create(mockData);

			expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
			expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
			expect(prisma.tenant.create).toHaveBeenCalledWith({
				data: {
					id: mockTenantUUID,
					name: 'Test Tenant',
					slug: 'test-tenant',
					users: {
						create: {
							email: 'admin@test.com',
							id: mockUserUUID,
							name: 'Admin',
							passwordHash: mockHash,
							role: 'admin',
						},
					},
				},
			});
			expect(result.id).toBe(mockTenantUUID);
		});

		it('should throw an error if prisma create fails', async () => {
			const mockData = {
				adminUser: { email: 'admin@test.com', name: 'Admin', password: 'password123' },
				name: 'Test Tenant',
				slug: 'test-tenant',
			};
			vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never);
			vi.mocked(prisma.tenant.create).mockRejectedValue(new Error('Unique constraint failed'));

			await expect(repository.create(mockData)).rejects.toThrow('Unique constraint failed');
		});
	});

	describe('delete', () => {
		it('should delete a tenant by id', async () => {
			vi.mocked(prisma.tenant.delete).mockResolvedValue({ id: 'tenant-1' } as any);
			await repository.delete('tenant-1');
			expect(prisma.tenant.delete).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
		});

		it('should throw if delete fails', async () => {
			vi.mocked(prisma.tenant.delete).mockRejectedValue(new Error('Record not found'));
			await expect(repository.delete('999')).rejects.toThrow('Record not found');
		});
	});

	describe('findAll', () => {
		it('should find all tenants', async () => {
			vi.mocked(prisma.tenant.findMany).mockResolvedValue([]);
			await repository.findAll();
			expect(prisma.tenant.findMany).toHaveBeenCalled();
		});
	});

	describe('findById', () => {
		it('should find a tenant by id', async () => {
			vi.mocked(prisma.tenant.findUnique).mockResolvedValue({ id: 'tenant-1' } as any);
			await repository.findById('tenant-1');
			expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
		});
	});

	describe('findBySlug', () => {
		it('should find a tenant by slug', async () => {
			vi.mocked(prisma.tenant.findUnique).mockResolvedValue({ slug: 'test-slug' } as any);
			await repository.findBySlug('test-slug');
			expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { slug: 'test-slug' } });
		});
	});

	describe('update', () => {
		it('should update a tenant', async () => {
			const updateData = { name: 'Updated Name' };
			vi.mocked(prisma.tenant.update).mockResolvedValue({ id: 'tenant-1', name: 'Updated Name' } as any);
			await repository.update('tenant-1', updateData);
			expect(prisma.tenant.update).toHaveBeenCalledWith({ data: updateData, where: { id: 'tenant-1' } });
		});

		it('should throw if update fails', async () => {
			vi.mocked(prisma.tenant.update).mockRejectedValue(new Error('Record to update not found'));
			await expect(repository.update('999', { name: 'Updated Name' })).rejects.toThrow('Record to update not found');
		});
	});
});
