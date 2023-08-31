import { logger } from '@1win/cdp-backend-tools';
import * as pack from '../../package.json';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'app-config',
  (): any =>
    ({
      API_PREFIX: '/example',
      API_VERSION: '/v1',
      SERVICE_NAME: pack.name,
      DOCS_URL: '/docs',
      RMQ_TRANSPORT_OPTIONS: {
        urls: process.env.RABBITMQ_HOSTS ? process.env.RABBITMQ_HOSTS.split(',') : [],
        queue: process.env.RABBITMQ_QUEUE_YOUR_SERVICE_NAME,
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
      HTTP_PORT: Number(process.env.HTTP_PORT),
      LOG_LEVEL: process.env.LOG_LEVEL || logger.LogLevels.INFO,
      SECRET_JWT: process.env.SECRET_JWT,
    } as const),
);
