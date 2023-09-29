import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { logger } from '@1win/cdp-backend-tools';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './configuration/config';
import { GlobalExceptionFilter } from './filter';
import { HealthModule } from './health/health.module';
import { UpdateModule } from './update/update.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './user/user.module';
import { ButtonModule } from './button/button.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    HealthModule,
    UpdateModule,
    TelegramModule,
    MongooseModule.forRoot(process.env.MONGO_URL),
    ButtonModule,
    UserModule
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
    consumer.apply(logger.LoggerMiddleware(config()))
    .exclude('health')
    .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
