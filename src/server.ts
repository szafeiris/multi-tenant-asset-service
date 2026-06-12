import express from 'express';

import { config } from '@/lib/configuration';
import { connectMongoose } from '@/lib/database/mongoose';
import { prisma } from '@/lib/database/prisma';
import { getLogger } from '@/lib/logging/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { tenantIsolationMiddleware } from '@/middleware/tenantIsolationMiddleware';
import createRoutes from '@/routes';

const app = express();
const port = config.server.port;
const logger = getLogger();

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello World!');
	logger.info('Response sent');
});

// A placeholder mock auth middleware to inject req.user until real JWT auth is built
const mockAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	(req as any).user = {
		tenantId: '00000000-0000-0000-0000-000000000000', // Mock valid UUID for testing
		role: 'admin',
	};
	next();
};

const apiRouter = express.Router();
apiRouter.use(mockAuth, tenantIsolationMiddleware);
createRoutes(apiRouter);
app.use('/api', apiRouter);

app.use(errorHandler);

async function startServer() {
	try {
		await connectMongoose();
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
