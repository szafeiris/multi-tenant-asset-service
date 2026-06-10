import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/lib/errors/error';
import { getLogger } from '@/lib/logging/logger';

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
