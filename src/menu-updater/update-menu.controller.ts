import { Controller, Get, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateMenuService } from './update-menu.service';

@Controller('update-menu')
@UseGuards(AuthGuard)
export class UpdateMenuController {
  constructor(private updateActionService: UpdateMenuService) {}
  @Get()
  async updateActionsFromSheet() {
    return this.updateActionService.loadActions().catch((err) => {
      throw new HttpException(err, HttpStatus.NOT_FOUND);
    });
  }
}
