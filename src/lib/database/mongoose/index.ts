import mongoose from 'mongoose';

import { config } from '@/lib/configuration';
import { getLogger } from '@/lib/logging/logger';

const logger = getLogger();

export async function connectMongoose() {
	try {
		const { database, host, password, port, user } = config.mongo;
		const uri = `mongodb://${user}:${password}@${host}:${port.toString()}/${database}?authSource=admin`;

		await mongoose.connect(uri);
		logger.info('Connected to MongoDB');
	} catch (error) {
		logger.error('Failed to connect to MongoDB', { error });
		throw error;
	}
}

export async function disconnectMongoose() {
	await mongoose.disconnect();
	logger.info('Disconnected from MongoDB');
}
