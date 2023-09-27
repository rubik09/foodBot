import { Controller, Get, Headers, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UpdateService } from './update.service';

@Controller('update')
export class UpdateController {
  constructor(private updateService: UpdateService) {}
  @Get()
  async updateFromGoogleSheet(@Headers('auth') authHeader: string, @Query('lang') lang: string | string[] | undefined) {
    if (authHeader === process.env.UPDATE_PASWD) {
      return this.updateService.updateBotStructure(lang).catch((err) => {
        throw new HttpException(err, HttpStatus.NOT_FOUND);
      });
    }
    throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  }
  @Get('test')
  async test() {
    return this.updateService.findAll();
  }
}
