import type { Request, Response } from 'express';

import type { ITenantService } from '@/services/TenantService';

import { getLogger } from '@/lib/logging/logger';
import { CreateTenantSchema, UpdateTenantSchema } from '@/models/Tenant';

const logger = getLogger();

export interface ITenantController {
	createTenant(req: Request, res: Response): Promise<void>;
	deleteTenant(req: Request, res: Response): Promise<void>;
	getTenantById(req: Request, res: Response): Promise<void>;

	updateTenant(req: Request, res: Response): Promise<void>;
}

export class TenantController implements ITenantController {
	private readonly tenantService: ITenantService;

	constructor(tenantService: ITenantService) {
		this.tenantService = tenantService;
	}

	public async createTenant(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = CreateTenantSchema.parse(req.body);
			const tenant = await this.tenantService.createTenant(validatedData);
			res.status(201).json(tenant);
		} catch (error) {
			logger.error('Failed to create tenant', { error });
			res.status(400).json({ details: error, error: 'Failed to create tenant' });
		}
	}

	public async deleteTenant(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			await this.tenantService.deleteTenant(id);

			res.status(204).send();
		} catch (error) {
			logger.error('Failed to delete tenant', { error });
			res.status(500).json({ error: 'Failed to delete tenant' });
		}
	}

	public async getTenantById(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const tenant = await this.tenantService.getTenantById(id);

			if (!tenant) {
				res.status(404).json({ error: 'Tenant not found' });
				return;
			}

			res.status(200).json(tenant);
		} catch (error) {
			logger.error('Failed to fetch tenant', { error });
			res.status(500).json({ error: 'Failed to fetch tenant' });
		}
	}

	public async updateTenant(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const validatedData = UpdateTenantSchema.parse(req.body);

			const tenant = await this.tenantService.updateTenant(id, validatedData);

			res.status(200).json(tenant);
		} catch (error) {
			logger.error('Failed to update tenant', { error });
			res.status(400).json({ details: error, error: 'Failed to update tenant' });
		}
	}
}
