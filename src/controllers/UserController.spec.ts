/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { IUserService } from '@/services/UserService';

import { UserController } from './UserController';

describe('UserController', () => {
	let controller: UserController;
	let userService: Mocked<IUserService>;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let json: Mock;
	let send: Mock;
	let status: Mock;

	beforeEach(() => {
		vi.clearAllMocks();

		userService = {
			createUser: vi.fn(),
			deleteUser: vi.fn(),
			getUserById: vi.fn(),
			getUsers: vi.fn(),
			updateUser: vi.fn(),
		};

		controller = new UserController(userService);

		json = vi.fn();
		send = vi.fn();
		status = vi.fn().mockReturnValue({ json, send });

		req = {
			body: {},
			params: {},
		};
		res = {
			status,
		} as any;
	});

	describe('createUser', () => {
		it('should create a user and return 201', async () => {
			req.body = { email: 'test@example.com', name: 'Test', password: 'password', role: 'USER', tenantId: '123e4567-e89b-12d3-a456-426614174000' };
			userService.createUser.mockResolvedValue({ id: 'user-1' } as any);

			await controller.createUser(req as Request, res as Response);

			expect(userService.createUser).toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(201);
			expect(json).toHaveBeenCalledWith({ id: 'user-1' });
		});

		it('should return 400 on validation failure', async () => {
			req.body = { email: 'invalid-email' }; // Missing required fields

			await controller.createUser(req as Request, res as Response);

			expect(userService.createUser).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.stringContaining('Invalid'),
				}),
			);
		});

		it('should return 400 if service throws', async () => {
			req.body = { email: 'user@test.com', name: 'John Doe', password: 'password', role: 'USER', tenantId: '123e4567-e89b-12d3-a456-426614174000' };
			userService.createUser.mockRejectedValue(new Error('Service failure'));

			await controller.createUser(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to create user' }));
		});
	});

	describe('deleteUser', () => {
		it('should delete a user and return 204', async () => {
			req.params = { id: 'user-1' };
			await controller.deleteUser(req as Request, res as Response);

			expect(userService.deleteUser).toHaveBeenCalledWith('user-1');
			expect(status).toHaveBeenCalledWith(204);
			expect(send).toHaveBeenCalled();
		});

		it('should return 500 if service throws', async () => {
			req.params = { id: 'user-1' };
			userService.deleteUser.mockRejectedValue(new Error('DB error'));

			await controller.deleteUser(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(500);
			expect(json).toHaveBeenCalledWith({ error: 'Failed to delete user' });
		});
	});

	describe('getUserById', () => {
		it('should return the user with 200', async () => {
			req.params = { id: 'user-1' };
			userService.getUserById.mockResolvedValue({ id: 'user-1' } as any);

			await controller.getUserById(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith({ id: 'user-1' });
		});

		it('should return 404 if user not found', async () => {
			req.params = { id: 'user-1' };
			userService.getUserById.mockResolvedValue(null);

			await controller.getUserById(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(404);
			expect(json).toHaveBeenCalledWith({ error: 'User not found' });
		});
	});

	describe('getUsers', () => {
		it('should return list of users with 200', async () => {
			userService.getUsers.mockResolvedValue([{ id: 'user-1' }] as any);

			await controller.getUsers(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith([{ id: 'user-1' }]);
		});
	});

	describe('updateUser', () => {
		it('should update user and return 200', async () => {
			req.params = { id: 'user-1' };
			req.body = { role: 'ADMIN' };
			userService.updateUser.mockResolvedValue({ id: 'user-1', role: 'ADMIN' } as any);

			await controller.updateUser(req as Request, res as Response);

			expect(userService.updateUser).toHaveBeenCalledWith('user-1', { role: 'ADMIN' });
			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith({ id: 'user-1', role: 'ADMIN' });
		});
	});
});
