import { Controller, Get, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateActionsService } from './update-prices.service';

@Controller('update-price')
@UseGuards(AuthGuard)
export class UpdateActionsController {
  constructor(private updateActionService: UpdateActionsService) {}
  @Get()
  async updateActionsFromSheet() {
    return this.updateActionService.loadActions().catch((err) => {
      throw new HttpException(err, HttpStatus.NOT_FOUND);
    });
  }
}
