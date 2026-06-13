import type { User } from '@prisma/client';

import type { CreateUserDto, UpdateUserDto } from '@/models/User';

import { getRequestContext, getTenantContext } from '@/lib/context/requestContext';
import { getAuditLogger } from '@/lib/logging/logger';
import { UserRepository } from '@/repositories/UserRepository';

export interface IUserService {
	createUser(data: CreateUserDto): Promise<User>;
	deleteUser(id: string): Promise<User>;
	getUserById(id: string): Promise<null | User>;
	getUsers(page?: number, limit?: number): Promise<{ data: User[]; total: number }>;
	updateUser(id: string, data: UpdateUserDto): Promise<User>;
}

export class UserService implements IUserService {
	private readonly userRepository: UserRepository;

	constructor(userRepository: UserRepository) {
		this.userRepository = userRepository;
	}

	public async createUser(data: CreateUserDto) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.create({ ...data, tenantId });
		const context = getRequestContext();
		getAuditLogger().info(`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: user [${user.id}], action: created`);
		return user;
	}

	public async deleteUser(id: string) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.findById(id);
		if (user?.tenantId !== tenantId) {
			throw new Error('User not found');
		}
		const deletedUser = await this.userRepository.delete(id);
		const context = getRequestContext();
		getAuditLogger().info(`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: user [${deletedUser.id}], action: deleted`);
		return deletedUser;
	}

	public async getUserById(id: string) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.findById(id);
		if (user && user.tenantId !== tenantId) {
			return null;
		}
		return user;
	}

	public async getUsers(page?: number, limit?: number) {
		const { tenantId } = getTenantContext();
		return this.userRepository.findAll(tenantId, page, limit);
	}

	public async updateUser(id: string, data: UpdateUserDto) {
		const { tenantId } = getTenantContext();
		const user = await this.userRepository.findById(id);
		if (user?.tenantId !== tenantId) {
			throw new Error('User not found');
		}
		const updatedUser = await this.userRepository.update(id, data);
		const context = getRequestContext();
		if (data.role && data.role !== user.role) {
			getAuditLogger().info(
				`reqId: ${context.requestId}, userId: ${context.userId ?? 'system'}, affected entity: user [${updatedUser.id}], action: role updated ${user.role} -> ${updatedUser.role}`,
			);
		}
		return updatedUser;
	}
}
