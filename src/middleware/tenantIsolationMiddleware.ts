import type { NextFunction, Request, Response } from 'express';

import { getLogger } from '@/lib/logging/logger';

import { TenantContextSchema, tenantContextStorage } from '../lib/context/tenantContext';

const logger = getLogger();

export function tenantIsolationMiddleware(req: Request, res: Response, next: NextFunction) {
	// Assume an earlier authentication middleware populates req.user
	// For example purposes, we cast it to any. In a real app, extend the Express Request interface.
	const user = (req as any).user;

	if (!user || !user.tenantId) {
		logger.warn('Tenant isolation middleware called without a valid user or tenantId');
		return res.status(401).json({ error: 'Unauthorized: Missing tenant context' });
	}

	const contextData = {
		role: user.role,
		tenantId: user.tenantId,
	};

	const parsedContext = TenantContextSchema.safeParse(contextData);

	if (!parsedContext.success) {
		logger.error('Invalid tenant context data', { errors: parsedContext.error.format() });
		return res.status(400).json({ error: 'Bad Request: Invalid tenant context' });
	}

	// Run the rest of the request within the AsyncLocalStorage context
	tenantContextStorage.run(parsedContext.data, () => {
		next();
	});
}
