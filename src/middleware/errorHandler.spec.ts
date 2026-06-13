/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { CustomError } from '@/lib/errors/error';

import { errorHandler } from './errorHandler';

describe('Error Handler Middleware', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let json: Mock;
	let status: Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {};
		json = vi.fn();
		status = vi.fn().mockReturnValue({ json });
		res = { status } as any;
		next = vi.fn();
	});

	it('should handle CustomError and return its status and message', () => {
		class TestError extends CustomError {
			constructor() {
				super('Test Error Message', 418, { additional: 'meta' });
				this.name = 'TestError';
			}
		}

		errorHandler(new TestError(), req as Request, res as Response, next);

		expect(status).toHaveBeenCalledWith(418);
		expect(json).toHaveBeenCalledWith({
			error: 'TestError',
			message: 'Test Error Message',
			meta: { additional: 'meta' },
		});
	});

	it('should handle generic Error and return 500 without leaking details', () => {
		const error = new Error('Secret database failure');

		errorHandler(error, req as Request, res as Response, next);

		expect(status).toHaveBeenCalledWith(500);
		expect(json).toHaveBeenCalledWith({
			error: 'InternalServerError',
			message: 'An unexpected error occurred',
		});
		// Ensure secret detail is NOT leaked
		expect(json.mock.calls[0][0].message).not.toContain('Secret database failure');
	});
});
