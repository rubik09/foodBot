// telegram.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user/user.service';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly userService: UserService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get()
  async handleGetUpdates(): Promise<any> {
    return this.telegramService.handleUpdates();
  }

  @Post()
  async handlePostUpdates(@Body() body: any): Promise<any> {
    return this.telegramService.handleUpdates();
  }
}
