/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import EventEmitter from 'events';
import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// We must mock getLogger BEFORE importing the module that uses it
const { mockDebug } = vi.hoisted(() => ({ mockDebug: vi.fn() }));
vi.mock('@/lib/logging/logger', () => ({
	getLogger: vi.fn(() => ({ debug: mockDebug })),
}));

import { requestLogger } from './requestLogger';

describe('RequestLogger Middleware', () => {
	let req: Partial<Request>;
	let res: EventEmitter & Response;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		req = { method: 'GET', originalUrl: '/api/test' };

		res = new EventEmitter() as any;
		res.statusCode = 200;

		next = vi.fn();
	});

	it('should log incoming request and response duration', () => {
		vi.useFakeTimers();

		requestLogger(req as Request, res as Response, next);

		expect(mockDebug).toHaveBeenCalledWith('Request: GET /api/test');
		expect(next).toHaveBeenCalled();

		// Advance time and simulate finish
		vi.advanceTimersByTime(50);
		res.emit('finish');

		expect(mockDebug).toHaveBeenCalledWith(expect.stringContaining('Response: 200 (OK) - 50ms'));

		vi.useRealTimers();
	});

	it('should handle missing status text gracefully', () => {
		res.statusCode = 999; // Unknown status

		requestLogger(req as Request, res as Response, next);
		res.emit('finish');

		expect(mockDebug).toHaveBeenCalledWith(expect.stringContaining('Response: 999  -'));
	});
});
