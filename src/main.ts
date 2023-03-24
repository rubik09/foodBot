import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { logger } from '@1win/cdp-backend-tools';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import config from './configuration/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
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
  await app.listen();
}
bootstrap();
