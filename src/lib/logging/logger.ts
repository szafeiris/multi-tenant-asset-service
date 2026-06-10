import winston from 'winston';
import 'winston-daily-rotate-file';

import { config } from '@/lib/configuration';

const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.printf((info) => `${info.timestamp as string} [${info.level}]: ${info.message as string}`),
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

const logger = winston.createLogger({
	format: logFormat,
	level: config.server.logLevel,
	transports: [generalTransport, errorTransport, consoleTransport],
});

const auditLogger = winston.createLogger({
	format: logFormat,
	level: 'info',
	transports: [auditTransport, consoleTransport],
});

export function getAuditLogger() {
	return auditLogger;
}

export function getLogger(context?: string) {
	return context ? logger.child({ context }) : logger;
}
