import { MongoDBContainer } from '@testcontainers/mongodb';
import { StartedMongoDBContainer } from '@testcontainers/mongodb';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { StartedRedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import fs from 'fs';

let pgContainer: StartedPostgreSqlContainer;
let mongoContainer: StartedMongoDBContainer;
let redisContainer: StartedRedisContainer;

export async function setup() {
	console.log('Starting containers...');

	[pgContainer, mongoContainer, redisContainer] = await Promise.all([
		new PostgreSqlContainer('postgres:16-alpine').start(),
		new MongoDBContainer('mongo:7').start(),
		new RedisContainer('redis:7-alpine').start(),
	]);

	const pgUri = pgContainer.getConnectionUri().replace('localhost', '127.0.0.1');
	const mongoUri = mongoContainer.getConnectionString().replace('localhost', '127.0.0.1');
	const redisUri = redisContainer.getConnectionUrl().replace('localhost', '127.0.0.1');

	const mongoEnvUri = `${mongoUri}/testdb?directConnection=true`;

	fs.writeFileSync(
		'.env.test.local',
		`
DATABASE_URL=${pgUri}
MONGO_URI=${mongoEnvUri}
REDIS_URL=${redisUri}
	`.trim(),
	);

	// Set for migrations
	process.env.DATABASE_URL = pgUri;
	process.env.MONGO_URI = mongoEnvUri;
	process.env.REDIS_URL = redisUri;

	console.log(`Containers started:\nPostgres: ${pgUri}\nMongo: ${mongoUri}\nRedis: ${redisUri}`);

	console.log('Running Prisma migrations...');
	execSync('npx prisma migrate deploy', { env: { ...process.env }, stdio: 'inherit' });
	console.log('Migrations complete.');
}

export async function teardown() {
	console.log('Stopping containers...');
	await Promise.all([pgContainer.stop(), mongoContainer.stop(), redisContainer.stop()]);
	console.log('Containers stopped.');
}
