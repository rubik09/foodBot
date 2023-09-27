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
import { TelegramService } from './telegram/telegram.service';
import { TelegramController } from './telegram/telegram.controller';
import { UserService } from './telegram/user/user.service';
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from './telegram/user/user.model';
import { ButtonSchema } from './telegram/button/button.model';
import { ButtonService } from './telegram/button/button.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    HealthModule,
    UpdateModule,
    MongooseModule.forRoot('mongodb+srv://artemkoludarov:S5SPbWyvCoY4QDXn@cluster0.ioxzizr.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp'), 
    MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{name: 'Button', schema: ButtonSchema}]),
  ],
  controllers: [AppController, TelegramController],
  providers: [
    AppService,
    UserService,
    ButtonService,
    TelegramService,
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
