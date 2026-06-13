/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { ITenantService } from '@/services/TenantService';

import { TenantController } from './TenantController';

describe('TenantController', () => {
	let controller: TenantController;
	let tenantService: Mocked<ITenantService>;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let json: Mock;
	let send: Mock;
	let status: Mock;

	beforeEach(() => {
		vi.clearAllMocks();

		tenantService = {
			createTenant: vi.fn(),
			deleteTenant: vi.fn(),
			getTenantById: vi.fn(),
			getTenantBySlug: vi.fn(),
			updateTenant: vi.fn(),
		};

		controller = new TenantController(tenantService);

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

	describe('createTenant', () => {
		it('should create a tenant and return 201', async () => {
			req.body = { adminUser: { email: 'admin@test.com', name: 'Admin', password: 'password123' }, name: 'Tenant', slug: 'tenant' };
			tenantService.createTenant.mockResolvedValue({ id: 'tenant-1' } as any);

			await controller.createTenant(req as Request, res as Response);

			expect(tenantService.createTenant).toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(201);
			expect(json).toHaveBeenCalledWith({ id: 'tenant-1' });
		});

		it('should return 400 on validation failure', async () => {
			req.body = { name: 'Tenant' }; // Missing slug and adminUser

			await controller.createTenant(req as Request, res as Response);

			expect(tenantService.createTenant).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.stringContaining('Invalid'),
				}),
			);
		});
	});

	describe('deleteTenant', () => {
		it('should delete a tenant and return 204', async () => {
			req.params = { id: 'tenant-1' };
			await controller.deleteTenant(req as Request, res as Response);

			expect(tenantService.deleteTenant).toHaveBeenCalledWith('tenant-1');
			expect(status).toHaveBeenCalledWith(204);
			expect(send).toHaveBeenCalled();
		});

		it('should return 500 if service throws', async () => {
			req.params = { id: 'tenant-1' };
			tenantService.deleteTenant.mockRejectedValue(new Error('Access denied'));

			await controller.deleteTenant(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(500);
		});
	});

	describe('getTenantById', () => {
		it('should return the tenant with 200', async () => {
			req.params = { id: 'tenant-1' };
			tenantService.getTenantById.mockResolvedValue({ id: 'tenant-1' } as any);

			await controller.getTenantById(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith({ id: 'tenant-1' });
		});

		it('should return 404 if tenant not found', async () => {
			req.params = { id: 'tenant-1' };
			tenantService.getTenantById.mockResolvedValue(null);

			await controller.getTenantById(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(404);
			expect(json).toHaveBeenCalledWith({ error: 'Tenant not found' });
		});
	});

	describe('updateTenant', () => {
		it('should update tenant and return 200', async () => {
			req.params = { id: 'tenant-1' };
			req.body = { name: 'Updated' };
			tenantService.updateTenant.mockResolvedValue({ id: 'tenant-1', name: 'Updated' } as any);

			await controller.updateTenant(req as Request, res as Response);

			expect(tenantService.updateTenant).toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(200);
		});
	});
});
