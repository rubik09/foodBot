import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { logger } from '@1win/cdp-backend-tools';
import config from './configuration/config';
import { GlobalExceptionFilter } from './filter';
import { HealthModule } from './health/health.module';
// import { UpdateModule } from './buttonsUpdater/update.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './telegram/user/user.module';
import { OrderModule } from './telegram/order/order.module';
import { UpdateMenuModule } from './actionsUpdater/update-menu.module';
import { ConfigService } from '@nestjs/config';
import { UpdatePriceModule } from './buttonsUpdater/update-price.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    HealthModule,
    // UpdateModule,
    TelegramModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('app-config.MONGO_URL'),
      }),
    }),
    OrderModule,
    UserModule,
    UpdateMenuModule,
    UpdatePriceModule,
    // UpdateActionsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  // Remove it if your app doesn't handle http server
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger.LoggerMiddleware(config()))
      .exclude('health')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
