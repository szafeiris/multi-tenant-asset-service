import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude, '**/._*'],
		env: {
			JWT_ACCESS_EXPIRATION: '1h',
			JWT_REFRESH_EXPIRATION: '7d',
			JWT_SECRET: 'testsecret',
			MONGO_DB: 'testdb',
			MONGO_HOST: 'localhost',
			MONGO_INITDB_ROOT_PASSWORD: 'testpassword',
			MONGO_INITDB_ROOT_USERNAME: 'testuser',
			MONGO_PORT: '27017',
			MONGO_URI: 'mongodb://localhost/testdb',
			POSTGRES_DB: 'postgres',
			POSTGRES_HOST: 'localhost',
			POSTGRES_PASSWORD: 'postgrespassword',
			POSTGRES_PORT: '5432',
			POSTGRES_USER: 'postgres',
			REDIS_HOST: 'localhost',
			REDIS_PORT: '6379',
			REDIS_URL: 'redis://localhost',
			DATABASE_URL: 'postgres://localhost/db',
			LOG_LEVEL: 'info',
			LOG_PATH: 'logs',
			PORT: '3000',
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
