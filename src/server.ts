import express from 'express';

import { config } from './lib/configuration';

const app = express();
const port = config.server.port;

app.get('/', (req, res) => {
	res.send('Hello World!');
	console.log('Response sent');
});

app.listen(port, () => {
	console.log(`App listening on port ${port.toString()}`);
});
