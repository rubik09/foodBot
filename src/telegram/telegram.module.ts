import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { UserService } from './user/user.service';
import { ButtonService } from './button/button.service';

@Module({
  controllers: [TelegramController, UserService, ButtonService],
})
export class TelegramModule {}