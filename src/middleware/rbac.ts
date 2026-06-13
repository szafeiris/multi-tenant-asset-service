import { NextFunction, Request, Response } from 'express';

import { requestContextStorage } from '@/lib/context/requestContext';
import { ForbiddenError } from '@/lib/errors/authErrors';
import { getLogger } from '@/lib/logging/logger';

const logger = getLogger();

export const hasRole = (allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const store = requestContextStorage.getStore();

		if (!store?.role) {
			logger.warn('RBAC failed: Missing role in request context');
			next(new ForbiddenError());
			return;
		}

		if (!allowedRoles.includes(store.role)) {
			logger.warn(`RBAC failed: User role '${store.role}' is not in allowed roles [${allowedRoles.join(', ')}]`);
			next(new ForbiddenError());
			return;
		}

		next();
	};
};
