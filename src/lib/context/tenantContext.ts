import { AsyncLocalStorage } from 'async_hooks';
import { z } from 'zod';

export const TenantContextSchema = z.object({
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	tenantId: z.string().uuid(),
	role: z.string().optional(),
});

export type TenantContext = z.infer<typeof TenantContextSchema>;

export const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantContext(): TenantContext {
	const context = tenantContextStorage.getStore();
	if (!context) {
		throw new Error(
			'Tenant context is missing. Ensure that the tenantIsolationMiddleware is used and you are within an active request context.',
		);
	}
	return context;
}
