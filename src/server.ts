import express from 'express';

import { config } from '@/lib/configuration';
import { prisma } from '@/lib/database/prisma';
import { errorHandler } from '@/lib/errors/error';
import { getLogger } from '@/lib/logging/logger';

const app = express();
const port = config.server.port;
const logger = getLogger();

app.get('/', (req, res) => {
	res.send('Hello World!');
	logger.info('Response sent');
});

app.use(errorHandler);

async function startServer() {
	try {
		await prisma.$connect();
		logger.info('Connected to the database');

		app.listen(port, () => {
			logger.info(`App listening on port ${port.toString()}`);
		});
	} catch (error: unknown) {
		logger.error('Failed to connect to the database', { error });
		process.exit(1);
	}
}

void startServer();
