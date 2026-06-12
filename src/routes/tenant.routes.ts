import { Router } from 'express';

import { TenantController } from '@/controllers/TenantController';

export default function createTenantRouter(tenantController: TenantController) {
	const tenantRouter = Router();

	tenantRouter.post('/', tenantController.createTenant.bind(tenantController));
	tenantRouter.get('/', tenantController.getTenants.bind(tenantController));
	tenantRouter.get('/:id', tenantController.getTenantById.bind(tenantController));
	tenantRouter.put('/:id', tenantController.updateTenant.bind(tenantController));
	tenantRouter.delete('/:id', tenantController.deleteTenant.bind(tenantController));

	return tenantRouter;
}
