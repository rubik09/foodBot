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
      HTTP_PORT: Number(process.env.HTTP_PORT),
      LOG_LEVEL: process.env.LOG_LEVEL || logger.LogLevels.INFO,
      SECRET_JWT: process.env.SECRET_JWT,
    } as const),
);
