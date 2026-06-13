import { Router } from 'express';

import type { ITenantController } from '@/controllers/TenantController';

import { hasRole } from '@/middleware/rbac';

export default function createTenantRouter(tenantController: ITenantController) {
	const tenantRouter = Router();

	tenantRouter.get('/:id', hasRole(['admin', 'editor', 'viewer']), tenantController.getTenantById.bind(tenantController));
	tenantRouter.put('/:id', hasRole(['admin']), tenantController.updateTenant.bind(tenantController));
	tenantRouter.delete('/:id', hasRole(['admin']), tenantController.deleteTenant.bind(tenantController));

	return tenantRouter;
}
