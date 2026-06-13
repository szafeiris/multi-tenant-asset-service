/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { getRequestContext, getTenantContext } from '@/lib/context/requestContext';
import { getAuditLogger } from '@/lib/logging/logger';
import { UserRepository } from '@/repositories/UserRepository';

import { UserService } from './UserService';

vi.mock('@/lib/context/requestContext', () => ({
	getRequestContext: vi.fn(),
	getTenantContext: vi.fn(),
}));

vi.mock('@/lib/logging/logger', () => ({
	getAuditLogger: vi.fn(),
}));

vi.mock('@/repositories/UserRepository');

describe('UserService', () => {
	let service: UserService;
	let userRepository: Mocked<UserRepository>;
	let mockAuditLogger: { info: Mock };

	beforeEach(() => {
		vi.clearAllMocks();

		userRepository = new UserRepository() as Mocked<UserRepository>;
		service = new UserService(userRepository);

		vi.mocked(getTenantContext).mockReturnValue({ tenantId: 'tenant-1' } as any);
		vi.mocked(getRequestContext).mockReturnValue({ requestId: 'req-1', userId: 'admin-1' });

		mockAuditLogger = { info: vi.fn() };
		vi.mocked(getAuditLogger).mockReturnValue(mockAuditLogger as any);
	});

	describe('createUser', () => {
		it('should create a user and log the action', async () => {
			const mockData = { email: 'test@example.com', name: 'Test', password: 'pass', role: 'USER', tenantId: 'tenant-1' };
			const createdUser = { id: 'user-1', ...mockData, tenantId: 'tenant-1' };

			userRepository.create.mockResolvedValue(createdUser as any);

			const result = await service.createUser(mockData);

			expect(userRepository.create).toHaveBeenCalledWith({ ...mockData, tenantId: 'tenant-1' });
			expect(mockAuditLogger.info).toHaveBeenCalledWith('reqId: req-1, userId: admin-1, affected entity: user [user-1], action: created');
			expect(result).toEqual(createdUser);
		});

		it('should throw if repository create fails', async () => {
			userRepository.create.mockRejectedValue(new Error('Create failed'));
			await expect(service.createUser({ email: 'test@example.com', name: 'Test', password: 'pass', role: 'USER', tenantId: 'tenant-1' })).rejects.toThrow('Create failed');
		});
	});

	describe('deleteUser', () => {
		it('should delete a user and log the action', async () => {
			const existingUser = { id: 'user-1', tenantId: 'tenant-1' };
			userRepository.findById.mockResolvedValue(existingUser as any);
			userRepository.delete.mockResolvedValue(existingUser as any);

			const result = await service.deleteUser('user-1');

			expect(userRepository.delete).toHaveBeenCalledWith('user-1');
			expect(mockAuditLogger.info).toHaveBeenCalledWith('reqId: req-1, userId: admin-1, affected entity: user [user-1], action: deleted');
			expect(result).toEqual(existingUser);
		});

		it('should throw User not found if user does not exist', async () => {
			userRepository.findById.mockResolvedValue(null);
			await expect(service.deleteUser('user-1')).rejects.toThrow('User not found');
		});

		it('should throw User not found if user belongs to a different tenant', async () => {
			const existingUser = { id: 'user-1', tenantId: 'tenant-2' };
			userRepository.findById.mockResolvedValue(existingUser as any);
			await expect(service.deleteUser('user-1')).rejects.toThrow('User not found');
		});
	});

	describe('getUserById', () => {
		it('should return the user if it belongs to the tenant', async () => {
			const existingUser = { id: 'user-1', tenantId: 'tenant-1' };
			userRepository.findById.mockResolvedValue(existingUser as any);

			const result = await service.getUserById('user-1');
			expect(result).toEqual(existingUser);
		});

		it('should return null if user belongs to a different tenant', async () => {
			const existingUser = { id: 'user-1', tenantId: 'tenant-2' };
			userRepository.findById.mockResolvedValue(existingUser as any);

			const result = await service.getUserById('user-1');
			expect(result).toBeNull();
		});

		it('should return null if user does not exist', async () => {
			userRepository.findById.mockResolvedValue(null);
			const result = await service.getUserById('user-1');
			expect(result).toBeNull();
		});
	});

	describe('getUsers', () => {
		it('should return all users for the current tenant', async () => {
			const users = [{ id: 'user-1' }];
			userRepository.findAll.mockResolvedValue(users as any);

			const result = await service.getUsers();
			expect(userRepository.findAll).toHaveBeenCalledWith('tenant-1', undefined, undefined);
			expect(result).toEqual(users);
		});
	});

	describe('updateUser', () => {
		it('should update the user', async () => {
			const existingUser = { id: 'user-1', role: 'USER', tenantId: 'tenant-1' };
			const updatedUser = { id: 'user-1', role: 'USER', tenantId: 'tenant-1' };

			userRepository.findById.mockResolvedValue(existingUser as any);
			userRepository.update.mockResolvedValue(updatedUser as any);

			const result = await service.updateUser('user-1', { role: 'USER' });

			expect(userRepository.update).toHaveBeenCalledWith('user-1', { role: 'USER' });
			expect(mockAuditLogger.info).not.toHaveBeenCalled(); // Role not actually changed
			expect(result).toEqual(updatedUser);
		});

		it('should log an audit event if the role is updated', async () => {
			const existingUser = { id: 'user-1', role: 'USER', tenantId: 'tenant-1' };
			const updatedUser = { id: 'user-1', role: 'ADMIN', tenantId: 'tenant-1' };

			userRepository.findById.mockResolvedValue(existingUser as any);
			userRepository.update.mockResolvedValue(updatedUser as any);

			await service.updateUser('user-1', { role: 'ADMIN' });

			expect(mockAuditLogger.info).toHaveBeenCalledWith('reqId: req-1, userId: admin-1, affected entity: user [user-1], action: role updated USER -> ADMIN');
		});

		it('should throw User not found if user does not exist', async () => {
			userRepository.findById.mockResolvedValue(null);
			await expect(service.updateUser('user-1', { role: 'ADMIN' })).rejects.toThrow('User not found');
		});

		it('should throw User not found if user belongs to a different tenant', async () => {
			const existingUser = { id: 'user-1', tenantId: 'tenant-2' };
			userRepository.findById.mockResolvedValue(existingUser as any);
			await expect(service.updateUser('user-1', { role: 'ADMIN' })).rejects.toThrow('User not found');
		});
	});
});
