import type { CreateUserDto, UpdateUserDto } from '@/models/User';

import { getTenantContext } from '@/lib/context/tenantContext';
import { UserRepository } from '@/repositories/UserRepository';

export class UserService {
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
