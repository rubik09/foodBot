import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as pack from '../package.json';

export enum LogLevels {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
}

export function createLogger() {
  return WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || LogLevels.INFO,
    format: winston.format.json(),
    defaultMeta: { service: pack.name },
    transports: getTransports(),
  });
}

function getTransports() {
  if (!process.env.ERROR_LOG_FILE) {
    console.error('ERROR_LOG_FILE ENV parameter is not provided.');
  }
  if (!process.env.COMBINED_LOG_FILE) {
    console.error('COMBINED_LOG_FILE ENV parameter is not provided.');
  }
  if (!process.env.ERROR_LOG_FILE || !process.env.COMBINED_LOG_FILE) {
    process.exit(1);
  }

  return [
    consoleTransport(),
    new winston.transports.File({ filename: process.env.ERROR_LOG_FILE, level: LogLevels.ERROR }),
    new winston.transports.File({ filename: process.env.COMBINED_LOG_FILE }),
  ];
}

function consoleTransport() {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH-MM:ss',
      }),
      winston.format.prettyPrint(),
      winston.format.colorize(),
      winston.format.align(),
      winston.format.printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      }),
    ),
  });
}
