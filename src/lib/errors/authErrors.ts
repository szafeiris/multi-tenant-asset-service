import { CustomError } from './error';

export class ForbiddenError extends CustomError {
	constructor(message?: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
		super(message, 403, meta, options);
		this.name = 'ForbiddenError';
	}
}

export class UnauthorizedError extends CustomError {
	constructor(message?: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
		super(message, 401, meta, options);
		this.name = 'UnauthorizedError';
	}
}
