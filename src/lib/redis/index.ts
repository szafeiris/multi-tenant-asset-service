import { Redis } from 'ioredis';

import { config } from '@/lib/configuration';
import { getLogger } from '@/lib/logging/logger';

const logger = getLogger('Redis');

export const redis = new Redis({
	host: config.redis.host,
	port: config.redis.port,
});

redis.on('connect', () => {
	logger.info('Connected to Redis');
});

redis.on('error', (err) => {
	logger.error('Redis error', { error: err });
});
