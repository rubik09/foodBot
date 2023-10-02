import { Module } from '@nestjs/common';
import { UpdateActionsService } from './update-actions.service';
import { UpdateActionsController } from './update-actions.controller';

@Module({
  providers: [UpdateActionsService],
  controllers: [UpdateActionsController]
})
export class UpdateActionsModule {}
