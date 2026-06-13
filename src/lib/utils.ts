import { ZodError } from 'zod';

export function formatZodError(error: unknown): null | string {
	if (error instanceof ZodError) {
		const messages = error.issues.map((issue) => {
			const field = issue.path.join('.') || 'body';
			if (issue.message.toLowerCase().includes('required') || (issue.code === 'invalid_type' && 'received' in issue && issue.received === 'undefined')) {
				return `Missing ${field}`;
			}
			return `Invalid ${field}`;
		});
		return messages.join(', ');
	}
	return null;
}

export function getEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export function getEnvNumber(name: string): number {
	const value = getEnv(name);
	const num = Number(value);
	if (isNaN(num)) {
		throw new Error(`Environment variable ${name} must be a valid number`);
	}
	return num;
}

export function getOptionalEnv(name: string): string | undefined {
	return process.env[name] ?? undefined;
}
