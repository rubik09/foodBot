import { NestFactory } from '@nestjs/core';
import { logger } from '@1win/cdp-backend-tools';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import config from './configuration/config';

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
  await app.listen(config().HTTP_PORT);
}
bootstrap();
