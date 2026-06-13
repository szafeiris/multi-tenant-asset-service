/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestContextStorage } from '@/lib/context/requestContext';
import { ForbiddenError } from '@/lib/errors/authErrors';

import { hasRole } from './rbac';

describe('RBAC Middleware', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {};
		res = {};
		next = vi.fn();
	});

	it('should call next if role is allowed', () => {
		const store = { role: 'ADMIN', tenantId: 'tenant-1', userId: 'user-1' };
		vi.spyOn(requestContextStorage, 'getStore').mockReturnValue(store as any);

		const middleware = hasRole(['ADMIN', 'SUPERADMIN']);
		middleware(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(); // Called without error
	});

	it('should throw ForbiddenError if role is not allowed', () => {
		const store = { role: 'USER', tenantId: 'tenant-1', userId: 'user-1' };
		vi.spyOn(requestContextStorage, 'getStore').mockReturnValue(store as any);

		const middleware = hasRole(['ADMIN', 'SUPERADMIN']);
		middleware(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
	});

	it('should throw ForbiddenError if role is missing in context', () => {
		const store = { tenantId: 'tenant-1', userId: 'user-1' };
		vi.spyOn(requestContextStorage, 'getStore').mockReturnValue(store as any);

		const middleware = hasRole(['ADMIN']);
		middleware(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
	});

	it('should throw ForbiddenError if store is not available', () => {
		vi.spyOn(requestContextStorage, 'getStore').mockReturnValue(undefined);

		const middleware = hasRole(['ADMIN']);
		middleware(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
	});
});
