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
