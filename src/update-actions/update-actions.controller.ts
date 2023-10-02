import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('update-actions')
@UseGuards(AuthGuard)
export class UpdateActionsController {
  @Get()
  async updateActionsFromSheet() {
    return JSON.stringify({
      message: 'route for update actions',
    });
  }
}
