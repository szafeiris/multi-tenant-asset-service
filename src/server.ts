import express, { Express } from 'express';
import { Logger } from 'winston';

import createControllers, { Controllers } from '@/controllers';
import { config } from '@/lib/configuration';
import { connectMongoose } from '@/lib/database/mongoose';
import { prisma } from '@/lib/database/prisma';
import { getLogger } from '@/lib/logging/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestContextMiddleware } from '@/middleware/requestContextMiddleware';
import { createRepositories, Repositories } from '@/repositories';
import createRoutes from '@/routes';
import createServices, { Services } from '@/services';

export class Application {
	private readonly app: Express;
	private readonly controllers: Controllers;
	private readonly logger: Logger;
	private readonly port: number;
	private readonly repositories: Repositories;

	private readonly services: Services;

	public constructor(port: number = config.server.port) {
		this.port = port;
		this.logger = getLogger('application');
		this.app = express();

		this.app.use(express.json());
		this.app.use(requestContextMiddleware);

		this.repositories = createRepositories();
		this.services = createServices(this.repositories);
		this.controllers = createControllers(this.services);
		const appRouter = createRoutes(this.controllers);

		this.app.use('/api', appRouter);

		this.app.use(errorHandler);
	}

	public async start() {
		try {
			await connectMongoose();
			await prisma.$connect();
			this.logger.info('Connected to the database');

			this.app.listen(this.port, () => {
				this.logger.info(`App listening on port ${this.port.toString()}`);
			});
		} catch (error: unknown) {
			this.logger.error('Failed to connect to the database', { error });
			process.exit(1);
		}
	}
}

const application = new Application();
void application.start();
