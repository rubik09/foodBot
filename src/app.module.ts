import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { logger } from '@1win/cdp-backend-tools';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './configuration/config';
import { GlobalExceptionFilter } from './filter';
import { HealthModule } from './health/health.module';
import { UpdateModule } from './update/update.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    HealthModule,
    UpdateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  // Remove it if your app doesn't handle http server
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger.LoggerMiddleware(config())).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
