import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { config } from '@/lib/configuration';
import { requestContextStorage } from '@/lib/context/requestContext';
import { UnauthorizedError } from '@/lib/errors/authErrors';
import { getLogger } from '@/lib/logging/logger';
import { redis } from '@/lib/redis';

const logger = getLogger();

export interface AuthRequest extends Request {
	user?: {
		role: string;
		tenantId: string;
		userId: string;
	};
}

export const TenantContextSchema = z.object({
	role: z.string().optional(),
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	tenantId: z.string().uuid(),
});

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		logger.warn('Authentication failed: Missing or invalid authorization header');
		next(new UnauthorizedError('Missing authentication token'));
		return;
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, config.jwt.secret) as {
			role: string;
			tenantId: string;
			userId: string;
		};

		const parsedContext = TenantContextSchema.safeParse({ role: decoded.role, tenantId: decoded.tenantId });
		if (!parsedContext.success) {
			logger.error('Invalid tenant context in token', { errors: parsedContext.error.issues });
			next(new UnauthorizedError('Invalid tenant context in token'));
			return;
		}

		// Check if the token is still valid in Redis
		const exists = await redis.get(`auth:access:${token}`);
		if (!exists) {
			logger.warn(`Authentication failed: Token is revoked or not found in Redis (userId: ${decoded.userId})`);
			next(new UnauthorizedError('Invalid or expired authentication token'));
			return;
		}

		const store = requestContextStorage.getStore();
		if (store) {
			store.userId = decoded.userId;
			store.tenantId = decoded.tenantId;
			store.role = decoded.role;
		}

		req.user = decoded;
		next();
	} catch (error) {
		logger.warn('Authentication failed: Invalid token signature or expired', { error });
		next(new UnauthorizedError('Invalid or expired authentication token'));
	}
};
