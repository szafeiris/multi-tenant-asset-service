import { NextFunction, Request, Response } from 'express';

import { getLogger } from '@/lib/logging/logger';

export class CustomError extends Error {
	public meta: Record<string, unknown>;
	public status: number;

	constructor(message?: string, status = 400, meta: Record<string, unknown> = {}, options?: ErrorOptions) {
		super(message, options);
		this.name = 'CustomError';
		this.status = status;
		this.meta = meta;
	}
}

export class BadRequestError extends CustomError {
	constructor(message?: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
		super(message, 400, meta, options);
		this.name = 'BadRequestError';
	}
}

export class InternalServerError extends CustomError {
	constructor(message?: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
		super(message, 500, meta, options);
		this.name = 'InternalServerError';
	}
}

export class NotFoundError extends CustomError {
	constructor(message?: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
		super(message, 404, meta, options);
		this.name = 'NotFoundError';
	}
}

export class ValidationError extends BadRequestError {
	constructor(message?: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
		super(message, meta, options);
		this.name = 'ValidationError';
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
	const logger = getLogger('ErrorHandler');

	if (err instanceof CustomError) {
		logger.error(`${err.name}: ${err.message}`, err);
		res.status(err.status).json({
			error: err.name,
			message: err.message,
			meta: Object.keys(err.meta).length > 0 ? err.meta : undefined,
		});
		return;
	}

	logger.error(`Unhandled Error: ${err.message}`, err);
	res.status(500).json({
		error: 'InternalServerError',
		message: 'An unexpected error occurred',
	});
}
