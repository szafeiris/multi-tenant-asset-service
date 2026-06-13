/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { redis } from './index';

interface CacheEvictOptions {
	key: EvictKeyGenerator | string;
}
interface CacheOptions {
	key: KeyGenerator | string;
	ttlSeconds?: number;
}

type EvictKeyGenerator = (args: any, result?: any) => string | string[];

type KeyGenerator = (args: any) => string;

export function Cacheable(options: CacheOptions) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const resolvedKey = typeof options.key === 'function' ? options.key(args) : options.key;

			const cached = await redis.get(resolvedKey);
			if (cached) {
				return JSON.parse(cached);
			}

			const result = await originalMethod.apply(this, args);

			if (result !== undefined && result !== null) {
				if (options.ttlSeconds) {
					await redis.set(resolvedKey, JSON.stringify(result), 'EX', options.ttlSeconds);
				} else {
					await redis.set(resolvedKey, JSON.stringify(result));
				}
			}

			return result;
		};

		return descriptor;
	};
}

export function CacheEvict(options: CacheEvictOptions) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args);

			const resolvedKeys = typeof options.key === 'function' ? options.key(args, result) : options.key;
			const keysToDelete = Array.isArray(resolvedKeys) ? resolvedKeys : [resolvedKeys];

			if (keysToDelete.length > 0) {
				await redis.del(...keysToDelete);
			}

			return result;
		};

		return descriptor;
	};
}
