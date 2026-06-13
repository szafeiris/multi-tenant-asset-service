/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { getRequestContext, getTenantContext } from '@/lib/context/requestContext';
import { getAuditLogger } from '@/lib/logging/logger';
import { TenantRepository } from '@/repositories/TenantRepository';

import { TenantService } from './TenantService';

vi.mock('@/lib/context/requestContext', () => ({
	getRequestContext: vi.fn(),
	getTenantContext: vi.fn(),
}));

vi.mock('@/lib/logging/logger', () => ({
	getAuditLogger: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
	redis: {
		del: vi.fn(),
		get: vi.fn(),
		pipeline: vi.fn().mockReturnValue({
			exec: vi.fn(),
			set: vi.fn(),
		}),
		set: vi.fn(),
	},
}));

vi.mock('@/repositories/TenantRepository');

describe('TenantService', () => {
	let service: TenantService;
	let tenantRepository: Mocked<TenantRepository>;
	let mockAuditLogger: { info: Mock };

	beforeEach(() => {
		vi.clearAllMocks();

		tenantRepository = new TenantRepository() as Mocked<TenantRepository>;
		service = new TenantService(tenantRepository);

		vi.mocked(getTenantContext).mockReturnValue({ role: undefined, tenantId: 'tenant-1' });
		vi.mocked(getRequestContext).mockReturnValue({ requestId: 'req-1', userId: 'admin-1' });

		mockAuditLogger = { info: vi.fn() };
		vi.mocked(getAuditLogger).mockReturnValue(mockAuditLogger as any);
	});

	describe('createTenant', () => {
		it('should create a tenant and log the action', async () => {
			const mockData = { adminUser: { email: 'test', name: 'Test', password: 'pwd' }, name: 'Tenant', slug: 'tenant' };
			const createdTenant = { id: 'tenant-2', name: 'Tenant', slug: 'tenant' };

			tenantRepository.create.mockResolvedValue(createdTenant as any);

			const result = await service.createTenant(mockData);

			expect(tenantRepository.create).toHaveBeenCalledWith(mockData);
			expect(mockAuditLogger.info).toHaveBeenCalledWith('reqId: req-1, userId: admin-1, affected entity: tenant [tenant-2], action: created');
			expect(result).toEqual(createdTenant);
		});

		it('should throw if repository create fails', async () => {
			tenantRepository.create.mockRejectedValue(new Error('Create failed'));
			await expect(service.createTenant({} as any)).rejects.toThrow('Create failed');
		});
	});

	describe('deleteTenant', () => {
		it('should delete a tenant if id matches context and log the action', async () => {
			const existingTenant = { id: 'tenant-1', name: 'Tenant' };
			tenantRepository.delete.mockResolvedValue(existingTenant as any);

			const result = await service.deleteTenant('tenant-1');

			expect(tenantRepository.delete).toHaveBeenCalledWith('tenant-1');
			expect(mockAuditLogger.info).toHaveBeenCalledWith('reqId: req-1, userId: admin-1, affected entity: tenant [tenant-1], action: deleted');
			expect(result).toEqual(existingTenant);
		});

		it('should throw Tenant not found or access denied if id does not match', async () => {
			await expect(service.deleteTenant('tenant-2')).rejects.toThrow('Tenant not found or access denied');
		});
	});

	describe('getTenantById', () => {
		it('should return the tenant if id matches context', async () => {
			const existingTenant = { id: 'tenant-1' };
			tenantRepository.findById.mockResolvedValue(existingTenant as any);

			const result = await service.getTenantById('tenant-1');
			expect(result).toEqual(existingTenant);
		});

		it('should return null if id does not match context', async () => {
			const result = await service.getTenantById('tenant-2');
			expect(result).toBeNull();
		});
	});

	describe('getTenantBySlug', () => {
		it('should return the tenant if it matches context', async () => {
			const existingTenant = { id: 'tenant-1', slug: 'tenant' };
			tenantRepository.findBySlug.mockResolvedValue(existingTenant as any);

			const result = await service.getTenantBySlug('tenant');
			expect(result).toEqual(existingTenant);
		});

		it('should return null if tenant belongs to different id', async () => {
			const existingTenant = { id: 'tenant-2', slug: 'tenant' };
			tenantRepository.findBySlug.mockResolvedValue(existingTenant as any);

			const result = await service.getTenantBySlug('tenant');
			expect(result).toBeNull();
		});
	});

	describe('updateTenant', () => {
		it('should update the tenant if id matches context', async () => {
			const updatedTenant = { id: 'tenant-1', name: 'New Name' };
			tenantRepository.update.mockResolvedValue(updatedTenant as any);

			const result = await service.updateTenant('tenant-1', { name: 'New Name' });

			expect(tenantRepository.update).toHaveBeenCalledWith('tenant-1', { name: 'New Name' });
			expect(result).toEqual(updatedTenant);
		});

		it('should throw Tenant not found or access denied if id does not match', async () => {
			await expect(service.updateTenant('tenant-2', { name: 'New Name' })).rejects.toThrow('Tenant not found or access denied');
		});
	});
});
