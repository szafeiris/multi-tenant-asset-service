/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestContextStorage } from '@/lib/context/requestContext';
import { UnauthorizedError } from '@/lib/errors/authErrors';
import { redis } from '@/lib/redis';

import { AuthRequest, requireAuth } from './auth';

vi.mock('jsonwebtoken');
vi.mock('@/lib/redis', () => ({
	redis: {
		get: vi.fn(),
	},
}));

describe('Auth Middleware', () => {
	let req: Partial<AuthRequest>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		req = { headers: {} };
		res = {};
		next = vi.fn();
	});

	it('should throw UnauthorizedError if no authorization header', async () => {
		await requireAuth(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
	});

	it('should throw UnauthorizedError if header does not start with Bearer', async () => {
		req.headers = { authorization: 'Basic token' };
		await requireAuth(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
	});

	it('should throw UnauthorizedError if token signature is invalid', async () => {
		req.headers = { authorization: 'Bearer bad-token' };
		vi.mocked(jwt.verify).mockImplementation(() => {
			throw new Error('Invalid signature');
		});

		await requireAuth(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
	});

	it('should throw UnauthorizedError if tenantId is not a valid UUID', async () => {
		req.headers = { authorization: 'Bearer valid-token' };
		vi.mocked(jwt.verify).mockReturnValue({ role: 'ADMIN', tenantId: 'not-a-uuid', userId: 'user-1' } as any);

		await requireAuth(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
	});

	it('should throw UnauthorizedError if token not in redis (revoked)', async () => {
		req.headers = { authorization: 'Bearer valid-token' };
		vi.mocked(jwt.verify).mockReturnValue({ role: 'ADMIN', tenantId: '123e4567-e89b-12d3-a456-426614174000', userId: 'user-1' } as any);
		vi.mocked(redis.get).mockResolvedValue(null);

		await requireAuth(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
	});

	it('should populate req.user, context store and call next if token is valid', async () => {
		const store = { role: '', tenantId: '', userId: '' };
		vi.spyOn(requestContextStorage, 'getStore').mockReturnValue(store as any);

		req.headers = { authorization: 'Bearer valid-token' };
		const decoded = { role: 'ADMIN', tenantId: '123e4567-e89b-12d3-a456-426614174000', userId: 'user-1' };
		vi.mocked(jwt.verify).mockReturnValue(decoded as any);
		vi.mocked(redis.get).mockResolvedValue('user-1');

		await requireAuth(req as AuthRequest, res as Response, next);

		expect(req.user).toEqual(decoded);
		expect(store.tenantId).toBe(decoded.tenantId);
		expect(store.userId).toBe(decoded.userId);
		expect(next).toHaveBeenCalledWith(); // Called without errors
	});
});
