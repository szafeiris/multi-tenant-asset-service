import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '@/lib/configuration';
import { UnauthorizedError } from '@/lib/errors/authErrors';
import { getLogger } from '@/lib/logging/logger';
import { redis } from '@/lib/redis';
import { AuthResponseDto, AuthTokensDto, LoginDto } from '@/models/Auth';
import { TenantRepository } from '@/repositories/TenantRepository';
import { UserRepository } from '@/repositories/UserRepository';

const logger = getLogger();

export interface IAuthService {
	login(data: LoginDto): Promise<AuthResponseDto>;
	logout(accessToken: string, refreshToken: string): Promise<void>;
	refresh(refreshToken: string): Promise<AuthTokensDto>;
}

export class AuthService implements IAuthService {
	constructor(
		private readonly tenantRepository: TenantRepository,
		private readonly userRepository: UserRepository,
	) {}

	public async login(data: LoginDto): Promise<AuthResponseDto> {
		const tenant = await this.tenantRepository.findBySlug(data.tenantSlug);
		if (!tenant) {
			logger.warn(`Login failed: Tenant not found - ${data.tenantSlug}`);
			throw new UnauthorizedError();
		}

		const user = await this.userRepository.findByEmailAndTenant(tenant.id, data.email);
		if (!user) {
			logger.warn(`Login failed: User not found - ${data.email} in tenant ${tenant.id}`);
			throw new UnauthorizedError();
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
		if (!isPasswordValid) {
			logger.warn(`Login failed: Invalid password for user ${user.id}`);
			throw new UnauthorizedError();
		}

		const payload = {
			role: user.role,
			tenantId: user.tenantId,
			userId: user.id,
		};

		const accessToken = jwt.sign(payload, config.jwt.secret, {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			expiresIn: config.jwt.accessExpiration as any,
		});

		const refreshToken = jwt.sign(payload, config.jwt.secret, {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			expiresIn: config.jwt.refreshExpiration as any,
		});

		const decodedAccess = jwt.decode(accessToken) as jwt.JwtPayload;
		const decodedRefresh = jwt.decode(refreshToken) as jwt.JwtPayload;
		if (decodedAccess.exp && decodedRefresh.exp) {
			const now = Math.floor(Date.now() / 1000);
			const accessTtl = decodedAccess.exp - now;
			const refreshTtl = decodedRefresh.exp - now;

			// We use the token itself or a hash of it as the key to verify it hasn't been revoked
			await redis.set(`auth:access:${accessToken}`, user.id, 'EX', accessTtl);
			await redis.set(`auth:refresh:${refreshToken}`, user.id, 'EX', refreshTtl);
		}

		logger.info(`User ${user.id} logged in successfully`);

		return {
			accessToken,
			refreshToken,
			user: {
				email: user.email,
				id: user.id,
				name: user.name,
				role: user.role,
				tenantId: user.tenantId,
			},
		};
	}

	public async logout(accessToken: string, refreshToken: string): Promise<void> {
		if (accessToken) {
			await redis.del(`auth:access:${accessToken}`);
		}
		if (refreshToken) {
			await redis.del(`auth:refresh:${refreshToken}`);
		}
		logger.info('User logged out, tokens invalidated');
	}

	public async refresh(refreshToken: string): Promise<AuthTokensDto> {
		try {
			const decoded = jwt.verify(refreshToken, config.jwt.secret) as {
				role: string;
				tenantId: string;
				userId: string;
			};

			// Check if token exists in Redis (hasn't been logged out or replaced)
			const exists = await redis.get(`auth:refresh:${refreshToken}`);
			if (!exists) {
				throw new UnauthorizedError();
			}

			// Invalidate the old refresh token (refresh token rotation)
			await redis.del(`auth:refresh:${refreshToken}`);

			const payload = {
				role: decoded.role,
				tenantId: decoded.tenantId,
				userId: decoded.userId,
			};

			const newAccessToken = jwt.sign(payload, config.jwt.secret, {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
				expiresIn: config.jwt.accessExpiration as any,
			});

			const newRefreshToken = jwt.sign(payload, config.jwt.secret, {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
				expiresIn: config.jwt.refreshExpiration as any,
			});

			const decodedAccess = jwt.decode(newAccessToken) as jwt.JwtPayload;
			const decodedRefresh = jwt.decode(newRefreshToken) as jwt.JwtPayload;
			if (decodedAccess.exp && decodedRefresh.exp) {
				const now = Math.floor(Date.now() / 1000);
				const accessTtl = decodedAccess.exp - now;
				const refreshTtl = decodedRefresh.exp - now;

				await redis.set(`auth:access:${newAccessToken}`, decoded.userId, 'EX', accessTtl);
				await redis.set(`auth:refresh:${newRefreshToken}`, decoded.userId, 'EX', refreshTtl);
			}

			return {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			};
		} catch (error) {
			logger.warn('Refresh token validation failed', { error });
			throw new UnauthorizedError();
		}
	}
}
