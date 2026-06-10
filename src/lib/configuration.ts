import { getEnv, getEnvNumber, getOptionalEnv } from '@/lib/utils';

export interface BaseConfiguration {
	host: string;
	port: number;
}

export interface Configuration {
	mongo: DatabaseConfiguration;
	postgres: PostgresConfiguration;
	redis: RedisConfiguration;
	server: ServerConfiguration;
}

export interface DatabaseConfiguration extends BaseConfiguration {
	database: string;
	password: string;
	user: string;
}

export interface PostgresConfiguration extends DatabaseConfiguration {
	databaseUrl?: string;
}

export type RedisConfiguration = BaseConfiguration;

export interface ServerConfiguration {
	logLevel: string;
	logPath: string;
	port: number;
}

function loadConfiguration(): Configuration {
	return {
		mongo: {
			database: getEnv('MONGO_DB'),
			host: getEnv('MONGO_HOST'),
			password: getEnv('MONGO_INITDB_ROOT_PASSWORD'),
			port: getEnvNumber('MONGO_PORT'),
			user: getEnv('MONGO_INITDB_ROOT_USERNAME'),
		},
		postgres: {
			database: getEnv('POSTGRES_DB'),
			databaseUrl: getOptionalEnv('DATABASE_URL'),
			host: getEnv('POSTGRES_HOST'),
			password: getEnv('POSTGRES_PASSWORD'),
			port: getEnvNumber('POSTGRES_PORT'),
			user: getEnv('POSTGRES_USER'),
		},
		redis: {
			host: getEnv('REDIS_HOST'),
			port: getEnvNumber('REDIS_PORT'),
		},
		server: {
			logLevel: getEnv('LOG_LEVEL'),
			logPath: getEnv('LOG_PATH'),
			port: getEnvNumber('PORT'),
		},
	};
}

export const config = loadConfiguration();
