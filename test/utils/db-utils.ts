import mongoose from 'mongoose';

import { prisma } from '@/lib/database/prisma';
import { redis } from '@/lib/redis';

export async function seedDatabases() {
	const passwordHash = await bcrypt.hash('password123', 10);

	// Seed Tenants
	const tenants = [
		{ createdAt: new Date('2024-01-15T10:00:00Z'), id: '11111111-1111-4111-8111-111111111111', name: 'Northwind Utilities', slug: 'northwind-utilities' },
		{ createdAt: new Date('2024-03-22T09:30:00Z'), id: '22222222-2222-4222-8222-222222222222', name: 'Beacon Sensors', slug: 'beacon-sensors' },
		{ createdAt: new Date('2024-06-10T14:15:00Z'), id: '33333333-3333-4333-8333-333333333333', name: 'Civic Works', slug: 'civic-works' },
	];
	await prisma.tenant.createMany({ data: tenants });

	// Seed Users
	const users = [
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'amelia@northwind.test',
			id: 'bdd640fb-0667-4ad1-9c80-317fa3b1799d',
			name: 'Amelia Chen',
			passwordHash,
			role: 'admin',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'sam@northwind.test',
			id: '23b8c1e9-3924-46de-beb1-3b9046685257',
			name: 'Sam Patel',
			passwordHash,
			role: 'editor',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'priya@northwind.test',
			id: 'bd9c66b3-ad3c-4d6d-9a3d-1fa7bc8960a9',
			name: 'Priya Iyer',
			passwordHash,
			role: 'editor',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'declan@northwind.test',
			id: '972a8469-1641-4f82-8b9d-2434e465e150',
			name: 'Declan Murphy',
			passwordHash,
			role: 'viewer',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			email: 'cora@beacon.test',
			id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
			name: 'Cora Reyes',
			passwordHash,
			role: 'admin',
			tenantId: '22222222-2222-4222-8222-222222222222',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			email: 'felix@beacon.test',
			id: '9a1de644-815e-46d1-bb8f-aa1837f8a88b',
			name: 'Felix Tanaka',
			passwordHash,
			role: 'editor',
			tenantId: '22222222-2222-4222-8222-222222222222',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			email: 'ines@beacon.test',
			id: 'b74d0fb1-32e7-4629-8fad-c1a606cb0fb3',
			name: 'Ines Costa',
			passwordHash,
			role: 'viewer',
			tenantId: '22222222-2222-4222-8222-222222222222',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'eli@civicworks.test',
			id: '6b65a6a4-8b81-48f6-b38a-088ca65ed389',
			name: 'Eli Brown',
			passwordHash,
			role: 'admin',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'rosa@civicworks.test',
			id: '47378190-96da-4dac-b2ff-5d2a386ecbe0',
			name: 'Rosa Hidalgo',
			passwordHash,
			role: 'editor',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'kalani@civicworks.test',
			id: 'c241330b-01a9-471f-9e8a-774bcf36d58b',
			name: 'Kalani Wong',
			passwordHash,
			role: 'editor',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'vance@civicworks.test',
			id: '6c307511-b2b9-437a-a8df-6ec4ce4a2bbd',
			name: 'Vance Okafor',
			passwordHash,
			role: 'viewer',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
	];
	await prisma.user.createMany({ data: users });

	// Seed Assets into MongoDB
	const seedJsonPath = path.join(process.cwd(), 'assignment', 'data', 'assets.seed.json');
	const assetsData = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8')) as Record<string, unknown>[];

	// Map the JSON structure to ensure dates are Date objects if needed, but Mongoose insertMany handles string parsing generally
	await Asset.insertMany(assetsData);
}

import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

import { Asset } from '@/models/Asset';

export async function truncateDatabases() {
	// Truncate PostgreSQL via Prisma
	await prisma.user.deleteMany();
	await prisma.tenant.deleteMany();

	// Truncate MongoDB
	if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
		const collections = mongoose.connection.collections;
		for (const key in collections) {
			const collection = collections[key];
			await collection.deleteMany({});
		}
	}

	// Flush Redis
	if (redis.status === 'ready') {
		await redis.flushall();
	}
}
