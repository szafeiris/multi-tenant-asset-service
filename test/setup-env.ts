import * as fs from 'fs';

// Read .env.test.local populated by globalSetup and inject into process.env
try {
	const envFile = fs.readFileSync('.env.test.local', 'utf-8');
	envFile.split(/\r?\n/).forEach((line) => {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) return;
		const [key, ...values] = trimmedLine.split('=');
		if (key && values.length > 0) {
			process.env[key.trim()] = values.join('=').trim();
		}
	});
} catch {
	// Ignore if file doesn't exist (e.g. not running global setup)
}
