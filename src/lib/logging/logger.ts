import winston from 'winston';
import 'winston-daily-rotate-file';

import { config } from '@/lib/configuration';
import { requestContextStorage } from '@/lib/context/requestContext';

const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.printf((info) => {
		const contextStr = info.context ? ` [${info.context as string}]` : '';
		const store = requestContextStorage.getStore();
		
		let reqStr = '';
		if (store) {
			const reqParts = [`reqId:${store.requestId}`];
			if (store.tenantId) reqParts.push(`tenant:${store.tenantId}`);
			if (store.userId) reqParts.push(`user:${store.userId}`);
			reqStr = ` [${reqParts.join(' ')}]`;
		}

		return `${info.timestamp as string} [${info.level}]${contextStr}${reqStr}: ${info.message as string}`;
	}),
);

const auditFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.printf((info) => `${info.timestamp as string}: ${info.message as string}`),
);

const auditConsoleFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.printf((info) => `\x1b[36m${info.timestamp as string}: ${info.message as string}\x1b[39m`),
);

const baseRotateOptions = {
	datePattern: 'YYYY-MM-DD',
	maxFiles: '30d',
	maxSize: '20m',
	zippedArchive: true,
};

const generalTransport = new winston.transports.DailyRotateFile({
	...baseRotateOptions,
	filename: `${config.server.logPath}/application-%DATE%.log`,
	level: config.server.logLevel,
});

const errorTransport = new winston.transports.DailyRotateFile({
	...baseRotateOptions,
	filename: `${config.server.logPath}/application-error-%DATE%.log`,
	level: 'error',
});

const auditTransport = new winston.transports.DailyRotateFile({
	...baseRotateOptions,
	filename: `${config.server.logPath}/application-audit-%DATE%.log`,
	level: 'info',
});

const consoleTransport = new winston.transports.Console({
	format: winston.format.combine(winston.format.colorize(), logFormat),
});

const auditConsoleTransport = new winston.transports.Console({
	format: auditConsoleFormat,
});

const logger = winston.createLogger({
	format: logFormat,
	level: config.server.logLevel,
	transports: [generalTransport, errorTransport, consoleTransport],
});

const auditLogger = winston.createLogger({
	format: auditFormat,
	level: 'info',
	transports: [auditTransport, auditConsoleTransport],
});

export function getAuditLogger() {
	return auditLogger;
}

export function getLogger(context?: string) {
	return context ? logger.child({ context }) : logger;
}
