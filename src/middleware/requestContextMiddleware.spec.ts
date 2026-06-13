import { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestContextStorage } from '@/lib/context/requestContext';

import { requestContextMiddleware } from './requestContextMiddleware';

vi.mock('node:crypto', () => ({
	default: {
		randomUUID: vi.fn(),
	},
}));

describe('RequestContext Middleware', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {};
		res = {};
		next = vi.fn();
	});

	it('should run next inside context storage with a generated requestId', () => {
		const mockUUID = 'uuid-1234';
		vi.mocked(crypto.randomUUID).mockReturnValue(mockUUID as never);

		const runSpy = vi.spyOn(requestContextStorage, 'run').mockImplementation((context, callback) => {
			expect(context).toEqual({ requestId: mockUUID });
			callback();
		});

		requestContextMiddleware(req as Request, res as Response, next);

		expect(crypto.randomUUID).toHaveBeenCalled();
		expect(runSpy).toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});
});
