import type { Request, Response } from 'express';

import { getLogger } from '@/lib/logging/logger';
import { CreateUserSchema, UpdateUserSchema } from '@/models/User';
import { UserService } from '@/services/UserService';

const logger = getLogger();

export class UserController {
	private readonly userService: UserService;

	constructor(userService: UserService) {
		this.userService = userService;
	}

	public async createUser(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = CreateUserSchema.parse(req.body);
			const user = await this.userService.createUser(validatedData);
			res.status(201).json(user);
		} catch (error) {
			logger.error('Failed to create user', { error });
			res.status(400).json({ error: 'Failed to create user', details: error });
		}
	}

	public async deleteUser(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const user = await this.userService.deleteUser(id);

			res.status(204).send();
		} catch (error) {
			logger.error('Failed to delete user', { error });
			res.status(500).json({ error: 'Failed to delete user' });
		}
	}

	public async getUserById(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const user = await this.userService.getUserById(id);

			if (!user) {
				res.status(404).json({ error: 'User not found' });
				return;
			}

			res.status(200).json(user);
		} catch (error) {
			logger.error('Failed to fetch user', { error });
			res.status(500).json({ error: 'Failed to fetch user' });
		}
	}

	public async getUsers(req: Request, res: Response): Promise<void> {
		try {
			const users = await this.userService.getUsers();
			res.status(200).json(users);
		} catch (error) {
			logger.error('Failed to fetch users', { error });
			res.status(500).json({ error: 'Failed to fetch users' });
		}
	}

	public async updateUser(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const validatedData = UpdateUserSchema.parse(req.body);

			const user = await this.userService.updateUser(id, validatedData);

			res.status(200).json(user);
		} catch (error) {
			logger.error('Failed to update user', { error });
			res.status(400).json({ error: 'Failed to update user', details: error });
		}
	}
}
