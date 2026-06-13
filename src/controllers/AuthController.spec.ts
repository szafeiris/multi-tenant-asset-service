/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { UnauthorizedError } from '@/lib/errors/authErrors';
import { IAuthService } from '@/services/AuthService';

import { AuthController } from './AuthController';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: Mocked<IAuthService>;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let json: Mock;
	let send: Mock;
	let status: Mock;

	beforeEach(() => {
		vi.clearAllMocks();

		authService = {
			login: vi.fn(),
			logout: vi.fn(),
			refresh: vi.fn(),
		};

		controller = new AuthController(authService);

		json = vi.fn();
		send = vi.fn();
		status = vi.fn().mockReturnValue({ json, send });

		req = {
			body: {},
			headers: {},
		};
		res = {
			status,
		} as any;
	});

	describe('login', () => {
		it('should return 200 with tokens on successful login', async () => {
			req.body = { email: 'user@test.com', password: 'password', tenant_slug: 'tenant' };
			const mockResponse = { accessToken: 'access', refreshToken: 'refresh', user: {} };
			authService.login.mockResolvedValue(mockResponse as any);

			await controller.login(req as Request, res as Response);

			expect(authService.login).toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith(mockResponse);
		});

		it('should return 400 on validation failure', async () => {
			req.body = { email: 'user@test.com' }; // Missing required fields

			await controller.login(req as Request, res as Response);

			expect(authService.login).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.stringContaining('Invalid'),
				}),
			);
		});

		it('should return 400 on service error', async () => {
			req.body = { email: 'user@test.com', password: 'bad', tenant_slug: 'tenant' };
			authService.login.mockRejectedValue(new UnauthorizedError());

			await controller.login(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: 'Failed to login',
				}),
			);
		});
	});

	describe('logout', () => {
		it('should call logout and return 204', async () => {
			req.headers = { authorization: 'Bearer access-token' };
			req.body = { refreshToken: 'refresh-token' };

			await controller.logout(req as Request, res as Response);

			expect(authService.logout).toHaveBeenCalledWith('access-token', 'refresh-token');
			expect(status).toHaveBeenCalledWith(204);
			expect(send).toHaveBeenCalled();
		});

		it('should return 204 even if headers are missing', async () => {
			req.headers = {};
			req.body = {};

			await controller.logout(req as Request, res as Response);

			expect(authService.logout).toHaveBeenCalledWith('', '');
			expect(status).toHaveBeenCalledWith(204);
		});
	});

	describe('refresh', () => {
		it('should return new tokens with 200', async () => {
			req.headers = { authorization: 'Bearer old-refresh' };
			const mockTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
			authService.refresh.mockResolvedValue(mockTokens);

			await controller.refresh(req as Request, res as Response);

			expect(authService.refresh).toHaveBeenCalledWith('old-refresh');
			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith(mockTokens);
		});

		it('should return 401 on missing token', async () => {
			req.headers = {}; // Missing refreshToken in header

			await controller.refresh(req as Request, res as Response);

			expect(authService.refresh).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(401);
		});
	});
});
