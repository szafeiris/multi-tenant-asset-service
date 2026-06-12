import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
	requestId: string;
	role?: string;
	tenantId?: string;
	userId?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
	const context = requestContextStorage.getStore();
	if (!context) {
		throw new Error('Request context is missing. Ensure that the requestContextMiddleware is used and you are within an active request context.');
	}
	return context;
}

export function getTenantContext() {
	const context = getRequestContext();
	if (!context.tenantId) {
		throw new Error('Tenant context is missing. Ensure that you are authenticated and have a valid tenantId.');
	}
	return { role: context.role, tenantId: context.tenantId };
}
