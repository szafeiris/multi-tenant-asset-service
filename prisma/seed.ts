import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log('Seeding database...');

	// Tenants
	const tenants = [
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			id: '11111111-1111-4111-8111-111111111111',
			name: 'Northwind Utilities',
			slug: 'northwind-utilities',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			id: '22222222-2222-4222-8222-222222222222',
			name: 'Beacon Sensors',
			slug: 'beacon-sensors',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			id: '33333333-3333-4333-8333-333333333333',
			name: 'Civic Works',
			slug: 'civic-works',
		},
	];

	for (const tenant of tenants) {
		await prisma.tenant.upsert({
			create: tenant,
			update: {},
			where: { id: tenant.id },
		});
	}

	// Users
	const users = [
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'amelia@northwind.test',
			id: 'bdd640fb-0667-4ad1-9c80-317fa3b1799d',
			name: 'Amelia Chen',
			role: 'admin',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'sam@northwind.test',
			id: '23b8c1e9-3924-46de-beb1-3b9046685257',
			name: 'Sam Patel',
			role: 'editor',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'priya@northwind.test',
			id: 'bd9c66b3-ad3c-4d6d-9a3d-1fa7bc8960a9',
			name: 'Priya Iyer',
			role: 'editor',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-01-15T10:00:00Z'),
			email: 'declan@northwind.test',
			id: '972a8469-1641-4f82-8b9d-2434e465e150',
			name: 'Declan Murphy',
			role: 'viewer',
			tenantId: '11111111-1111-4111-8111-111111111111',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			email: 'cora@beacon.test',
			id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
			name: 'Cora Reyes',
			role: 'admin',
			tenantId: '22222222-2222-4222-8222-222222222222',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			email: 'felix@beacon.test',
			id: '9a1de644-815e-46d1-bb8f-aa1837f8a88b',
			name: 'Felix Tanaka',
			role: 'editor',
			tenantId: '22222222-2222-4222-8222-222222222222',
		},
		{
			createdAt: new Date('2024-03-22T09:30:00Z'),
			email: 'ines@beacon.test',
			id: 'b74d0fb1-32e7-4629-8fad-c1a606cb0fb3',
			name: 'Ines Costa',
			role: 'viewer',
			tenantId: '22222222-2222-4222-8222-222222222222',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'eli@civicworks.test',
			id: '6b65a6a4-8b81-48f6-b38a-088ca65ed389',
			name: 'Eli Brown',
			role: 'admin',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'rosa@civicworks.test',
			id: '47378190-96da-4dac-b2ff-5d2a386ecbe0',
			name: 'Rosa Hidalgo',
			role: 'editor',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'kalani@civicworks.test',
			id: 'c241330b-01a9-471f-9e8a-774bcf36d58b',
			name: 'Kalani Wong',
			role: 'editor',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
		{
			createdAt: new Date('2024-06-10T14:15:00Z'),
			email: 'vance@civicworks.test',
			id: '6c307511-b2b9-437a-a8df-6ec4ce4a2bbd',
			name: 'Vance Okafor',
			role: 'viewer',
			tenantId: '33333333-3333-4333-8333-333333333333',
		},
	];

	for (const user of users) {
		await prisma.user.upsert({
			create: user,
			update: {},
			where: { id: user.id },
		});
	}

	console.log('Seeding completed.');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e: unknown) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
