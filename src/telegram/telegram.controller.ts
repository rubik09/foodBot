import { Controller, Get, HttpStatus } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  @ApiOperation({ description: 'Bot endpoint' })
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  async handleGetUpdates(): Promise<any> {
    const result = await this.telegramService.handleUpdates();
    return {
      status: HttpStatus.OK,
      description: 'Bot is running',
    };
  }
}
