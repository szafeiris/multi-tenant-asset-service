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
