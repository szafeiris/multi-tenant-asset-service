import type { Request, Response } from 'express';

import type { IUserService } from '@/services/UserService';

import { getLogger } from '@/lib/logging/logger';
import { CreateUserSchema, UpdateUserSchema } from '@/models/User';

const logger = getLogger();

export interface IUserController {
	createUser(req: Request, res: Response): Promise<void>;
	deleteUser(req: Request, res: Response): Promise<void>;
	getUserById(req: Request, res: Response): Promise<void>;
	getUsers(req: Request, res: Response): Promise<void>;
	updateUser(req: Request, res: Response): Promise<void>;
}

export class UserController implements IUserController {
	private readonly userService: IUserService;

	constructor(userService: IUserService) {
		this.userService = userService;
	}

	public async createUser(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = CreateUserSchema.parse(req.body);
			const user = await this.userService.createUser(validatedData);
			res.status(201).json(user);
		} catch (error) {
			logger.error('Failed to create user', { error });
			res.status(400).json({ details: error, error: 'Failed to create user' });
		}
	}

	public async deleteUser(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			await this.userService.deleteUser(id);

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
			res.status(400).json({ details: error, error: 'Failed to update user' });
		}
	}
}
