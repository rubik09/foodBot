import { Controller, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UpdatePriceService } from './update-price.service';
@Controller('update-price')
@UseGuards(AuthGuard)
export class UpdatePriceController {
  constructor(private updatePriceService: UpdatePriceService) {}
  async updateActionsFromSheet() {
    return this.updatePriceService.loadActions().catch((err) => {
      throw new HttpException(err, HttpStatus.NOT_FOUND);
    });
  }
}
