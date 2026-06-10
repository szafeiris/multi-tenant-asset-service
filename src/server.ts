import express from 'express';

import { config } from '@/lib/configuration';
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

app.listen(port, () => {
	logger.info(`App listening on port ${port.toString()}`);
});
