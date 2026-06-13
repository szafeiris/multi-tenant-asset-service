import { NextFunction, Request, Response } from 'express';
import http from 'http';

import { getLogger } from '@/lib/logging/logger';

const logger = getLogger('http');

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const start = Date.now();

	logger.debug(`Request: ${req.method} ${req.originalUrl}`);

	res.on('finish', () => {
		const duration = Date.now() - start;
		const statusText = http.STATUS_CODES[res.statusCode] ?? null;
		logger.debug(`Response: ${res.statusCode.toString()} ${statusText ? `(${statusText})` : ''} - ${duration.toString()}ms`);
	});

	next();
};
