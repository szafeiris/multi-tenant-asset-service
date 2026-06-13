/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

import { UnauthorizedError } from '@/lib/errors/authErrors';
import { redis } from '@/lib/redis';
import { TenantRepository } from '@/repositories/TenantRepository';
import { UserRepository } from '@/repositories/UserRepository';

import { AuthService } from './AuthService';

vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('@/lib/redis', () => ({
	redis: {
		del: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
	},
}));
vi.mock('@/repositories/TenantRepository');
vi.mock('@/repositories/UserRepository');

describe('AuthService', () => {
	let service: AuthService;
	let tenantRepository: Mocked<TenantRepository>;
	let userRepository: Mocked<UserRepository>;

	beforeEach(() => {
		vi.clearAllMocks();
		tenantRepository = new TenantRepository() as Mocked<TenantRepository>;
		userRepository = new UserRepository() as Mocked<UserRepository>;
		service = new AuthService(tenantRepository, userRepository);
	});

	describe('login', () => {
		const loginData = { email: 'user@test.com', password: 'password', tenant_slug: 'tenant' };

		it('should return tokens on successful login', async () => {
			tenantRepository.findBySlug.mockResolvedValue({ id: 'tenant-1' } as any);
			userRepository.findByEmailAndTenant.mockResolvedValue({ id: 'user-1', passwordHash: 'hash', role: 'ADMIN', tenantId: 'tenant-1' } as any);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			vi.mocked(jwt.sign)
				.mockReturnValueOnce('access-token' as any)
				.mockReturnValueOnce('refresh-token' as any);

			vi.mocked(jwt.decode).mockReturnValueOnce({ exp: 1234567890 }).mockReturnValueOnce({ exp: 1234567890 });

			const result = await service.login(loginData);

			expect(result.accessToken).toBe('access-token');
			expect(result.refreshToken).toBe('refresh-token');
			expect(redis.set).toHaveBeenCalledTimes(2);
		});

		it('should throw UnauthorizedError if tenant not found', async () => {
			tenantRepository.findBySlug.mockResolvedValue(null);
			await expect(service.login(loginData)).rejects.toThrow(UnauthorizedError);
		});

		it('should throw UnauthorizedError if user not found', async () => {
			tenantRepository.findBySlug.mockResolvedValue({ id: 'tenant-1' } as any);
			userRepository.findByEmailAndTenant.mockResolvedValue(null);
			await expect(service.login(loginData)).rejects.toThrow(UnauthorizedError);
		});

		it('should throw UnauthorizedError if password invalid', async () => {
			tenantRepository.findBySlug.mockResolvedValue({ id: 'tenant-1' } as any);
			userRepository.findByEmailAndTenant.mockResolvedValue({ id: 'user-1', passwordHash: 'hash' } as any);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
			await expect(service.login(loginData)).rejects.toThrow(UnauthorizedError);
		});
	});

	describe('logout', () => {
		it('should delete tokens from redis', async () => {
			await service.logout('access-token', 'refresh-token');
			expect(redis.del).toHaveBeenCalledWith('auth:access:access-token');
			expect(redis.del).toHaveBeenCalledWith('auth:refresh:refresh-token');
		});
	});

	describe('refresh', () => {
		it('should return new tokens', async () => {
			vi.mocked(jwt.verify).mockReturnValue({ role: 'ADMIN', tenantId: 'tenant-1', userId: 'user-1' } as any);
			vi.mocked(redis.get).mockResolvedValue('user-1');

			vi.mocked(jwt.sign)
				.mockReturnValueOnce('new-access-token' as any)
				.mockReturnValueOnce('new-refresh-token' as any);

			vi.mocked(jwt.decode).mockReturnValueOnce({ exp: 1234567890 }).mockReturnValueOnce({ exp: 1234567890 });

			const result = await service.refresh('refresh-token');

			expect(result.accessToken).toBe('new-access-token');
			expect(result.refreshToken).toBe('new-refresh-token');
			expect(redis.del).toHaveBeenCalledWith('auth:refresh:refresh-token');
			expect(redis.set).toHaveBeenCalledTimes(2);
		});

		it('should throw UnauthorizedError if token is invalid', async () => {
			vi.mocked(jwt.verify).mockImplementation(() => {
				throw new Error('Invalid token');
			});
			await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedError);
		});

		it('should throw UnauthorizedError if token not in redis', async () => {
			vi.mocked(jwt.verify).mockReturnValue({} as any);
			vi.mocked(redis.get).mockResolvedValue(null);
			await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedError);
		});
	});
});
