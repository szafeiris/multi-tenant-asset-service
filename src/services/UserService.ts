import type { User } from '@prisma/client';

import type { CreateUserDto, UpdateUserDto } from '@/models/User';

import { getTenantContext } from '@/lib/context/requestContext';
import { UserRepository } from '@/repositories/UserRepository';

export interface IUserService {
	createUser(data: CreateUserDto): Promise<User>;
	deleteUser(id: string): Promise<User>;
	getUserById(id: string): Promise<null | User>;
	getUsers(): Promise<User[]>;
	updateUser(id: string, data: UpdateUserDto): Promise<User>;
}

export class UserService implements IUserService {
	private readonly userRepository: UserRepository;

	constructor(userRepository: UserRepository) {
		this.userRepository = userRepository;
	}

	public async createUser(data: CreateUserDto) {
		const { tenantId } = getTenantContext();
		return this.userRepository.create({ ...data, tenantId });
	}

	public async deleteUser(id: string) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.findById(id);
		if (user?.tenantId !== tenantId) {
			throw new Error('User not found');
		}
		return this.userRepository.delete(id);
	}

	public async getUserById(id: string) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.findById(id);
		if (user && user.tenantId !== tenantId) {
			return null;
		}
		return user;
	}

	public async getUsers() {
		const { tenantId } = getTenantContext();
		return this.userRepository.findAll(tenantId);
	}

	public async updateUser(id: string, data: UpdateUserDto) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.findById(id);
		if (user?.tenantId !== tenantId) {
			throw new Error('User not found');
		}
		return this.userRepository.update(id, data);
	}
}
