import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { connectMongoose, disconnectMongoose } from '@/lib/database/mongoose';
import { getLogger } from '@/lib/logging/logger';
import { Asset } from '@/models/Asset';

const logger = getLogger();

async function main() {
	try {
		await connectMongoose();

		logger.info('Reading assets seed file...');
		const dataPath = resolve(process.cwd(), 'assignment/data/assets.seed.json');
		const fileContent = await readFile(dataPath, 'utf-8');
		const assets = JSON.parse(fileContent) as Record<string, unknown>[];

		logger.info(`Found ${assets.length.toString()} assets to seed.`);

		// Clear existing assets to ensure a clean slate
		await Asset.deleteMany({});
		logger.info('Cleared existing assets.');

		// Insert assets
		await Asset.insertMany(assets);
		logger.info('Successfully inserted all assets.');
	} catch (error) {
		console.error('Error during asset seeding:', error);
		process.exitCode = 1;
	} finally {
		await disconnectMongoose();
	}
}

void main();
