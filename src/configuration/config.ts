import { logger } from '@1win/cdp-backend-tools';
import * as pack from '../../package.json';

export default (): any => ({
  API_PREFIX: '/v1',
  SERVICE_NAME: pack.name,
  DOCS_URL: '/docs',
  TCP_TRANSPORT_OPTIONS: {
    retryAttempts: parseInt(process.env.TCP_RETRY_ATTEMPTS),
    retryDelay: parseInt(process.env.TCP_RETRY_DELAY),
    port: parseInt(process.env.TCP_PORT),
  },
  RMQ_TRANSPORT_OPTIONS: {
    urls: [process.env.RABBITMQ_HOST],
    queue: process.env.RABBITMQ_QUEUE_NAME,
    queueOptions: {
      durable: true,
    },
  },
  CDP_DB_OPTIONS: {
    type: 'mysql',
    host: process.env.MYSQL_CDP_HOST,
    port: Number(process.env.MYSQL_CDP_PORT),
    database: process.env.MYSQL_CDP_DB,
    username: process.env.MYSQL_CDP_USER,
    password: process.env.MYSQL_CDP_PASSWORD,
  },
  HTTP_PORT: parseInt(process.env.HTTP_PORT),
  LOG_LEVEL: process.env.LOG_LEVEL || logger.LogLevels.INFO,
  SECRET_JWT: process.env.SECRET_JWT,
});
