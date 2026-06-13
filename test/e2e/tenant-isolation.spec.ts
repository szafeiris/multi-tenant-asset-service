import * as express from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Application } from '@/server';

import { seedDatabases, truncateDatabases } from '../utils/db-utils';

let app: express.Application;

beforeAll(async () => {
	const appInstance = new Application();
	await appInstance.initializeDatabases();
	app = appInstance.getApp();
}, 30000);

beforeEach(async () => {
	await truncateDatabases();
	await seedDatabases();
});

describe('Multi-Tenant Data Isolation (E2E)', () => {
	it('should strictly isolate data between seeded tenants', async () => {
		// 1. Identify tenants from seed
		const tenantAId = '11111111-1111-4111-8111-111111111111'; // Northwind
		const tenantBId = '22222222-2222-4222-8222-222222222222'; // Beacon

		// 2. Login as Amelia (Tenant A admin)
		const loginResA = await request(app)
			.post('/api/auth/login')
			.send({ email: 'amelia@northwind.test', password: 'password123', tenant_slug: 'northwind-utilities' })
			.expect(200);
		const tokenA = String((loginResA.body as Record<string, unknown>).accessToken);

		// 3. Login as Cora (Tenant B admin)
		const loginResB = await request(app).post('/api/auth/login').send({ email: 'cora@beacon.test', password: 'password123', tenant_slug: 'beacon-sensors' }).expect(200);
		const tokenB = String((loginResB.body as Record<string, unknown>).accessToken);

		// 4. Verify Amelia sees only Northwind assets
		const listResA = await request(app).get('/api/assets').set('Authorization', `Bearer ${tokenA}`).expect(200);

		const assetsA = listResA.body as Record<string, unknown>[];
		expect(assetsA.length).toBeGreaterThan(0);
		// Every asset must belong to Tenant A
		for (const asset of assetsA) {
			expect(asset.tenant_id).toBe(tenantAId);
		}

		// 5. Verify Cora sees only Beacon assets
		const listResB = await request(app).get('/api/assets').set('Authorization', `Bearer ${tokenB}`).expect(200);

		const assetsB = listResB.body as Record<string, unknown>[];
		expect(assetsB.length).toBeGreaterThan(0);
		// Every asset must belong to Tenant B
		for (const asset of assetsB) {
			expect(asset.tenant_id).toBe(tenantBId);
		}

		// 6. Cross-tenant isolation verification
		const assetB = assetsB[0]; // Pick an asset belonging to B

		// Amelia attempts to fetch Cora's asset directly
		await request(app)
			.get(`/api/assets/${String(assetB.id)}`)
			.set('Authorization', `Bearer ${tokenA}`)
			.expect(404);
	});
});
