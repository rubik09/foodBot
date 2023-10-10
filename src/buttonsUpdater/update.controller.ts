import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { UpdateService } from './update.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('update-buttons')
@UseGuards(AuthGuard)
export class UpdateController {
  constructor(private updateService: UpdateService) {}
  @Get()
  async updateFromGoogleSheet(@Query('lang') lang: string | string[] | undefined) {
    return this.updateService.updateBotStructure(lang).catch((err) => {
      throw new HttpException(err, HttpStatus.NOT_FOUND);
    });
  }
  @Get('test')
  async test() {
    return this.updateService.findAll();
  }
}
