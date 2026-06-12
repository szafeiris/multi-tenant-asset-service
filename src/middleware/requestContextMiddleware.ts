import type { NextFunction, Request, Response } from 'express';

import crypto from 'node:crypto';

import { requestContextStorage } from '@/lib/context/requestContext';

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const requestId = crypto.randomUUID();
	requestContextStorage.run({ requestId }, () => {
		next();
	});
};
