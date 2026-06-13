import mongoose from 'mongoose';

import { config } from '@/lib/configuration';
import { getLogger } from '@/lib/logging/logger';

const logger = getLogger();

export async function connectMongoose() {
	try {
		let uri = process.env.MONGO_URI;
		if (!uri) {
			const { database, host, password, port, user } = config.mongo;
			uri = `mongodb://${user}:${password}@${host}:${port.toString()}/${database}?authSource=admin`;
		}

		await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
		logger.info('Connected to MongoDB');
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		logger.error(`Failed to connect to MongoDB: ${message}`, { error });
		throw error;
	}
}

export async function disconnectMongoose() {
	await mongoose.disconnect();
	logger.info('Disconnected from MongoDB');
}
