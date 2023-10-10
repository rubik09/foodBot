import { NestFactory } from '@nestjs/core';
import { logger } from '@1win/cdp-backend-tools';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import config from './configuration/config';
import * as packageJson from 'package.json';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';

const swaggerCfg = new DocumentBuilder()
  .setTitle(packageJson.name)
  .setDescription(packageJson.description)
  .setVersion(packageJson.version)
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logger.createLogger(config()),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        return errors;
      },
    }),
  );

  const configService = app.get(ConfigService);

  const API_PREFIX = configService.get('app-config.API_PREFIX');
  const API_VERSION = configService.get('app-config.API_VERSION');
  app.setGlobalPrefix(`${API_PREFIX}${API_VERSION}`);

  const document = SwaggerModule.createDocument(app, swaggerCfg);

  if (configService.get('app-config.CREATE_DOCS')) {
    writeFileSync(`${__dirname}/openapi.json`, JSON.stringify(document));
    console.log(`${__dirname}`);
    process.exit(0);
  }
  const DOCS_URL = configService.get('app-config.DOCS_URL');

  SwaggerModule.setup(`${API_PREFIX}${DOCS_URL}`, app, document);

  const HTTP_PORT = configService.get('app-config.HTTP_PORT');
  await app.listen(HTTP_PORT);
}
bootstrap();
