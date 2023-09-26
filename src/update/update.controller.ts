import { Controller, Get, Headers, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UpdateService } from './update.service';

@Controller('update')
export class UpdateController {
  constructor(private updateService: UpdateService) {}
  @Get()
  updateFromGoogleSheet(@Headers('auth') authHeader: string, @Query('lang') lang: string | string[] | null) {
    if (authHeader === process.env.UPDATE_PASWD) return this.updateService.updateBotStructure(lang);
    throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
