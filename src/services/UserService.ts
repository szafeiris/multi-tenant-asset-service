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
		return this.userRepository.create(data);
	}

	public async deleteUser(id: string) {
		return this.userRepository.delete(id);
	}

	public async getUserById(id: string) {
		return this.userRepository.findById(id);
	}

	public async getUsers() {
		const { tenantId } = getTenantContext();
		// In a real app, Admins might be able to fetch cross-tenant, but by default we isolate
		return this.userRepository.findAll(tenantId);
	}

	public async updateUser(id: string, data: UpdateUserDto) {
		return this.userRepository.update(id, data);
	}
}
