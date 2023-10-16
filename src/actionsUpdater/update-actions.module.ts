import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateActionsService } from './update-actions.service';
import { UpdateActionsController } from './update-actions.controller';
import { Action, ActionSchema } from '../schemas/action.schema';
import { UpdateActionProvider } from './update-actions.provider';

@Module({
  imports: [MongooseModule.forFeature([{ name: Action.name, schema: ActionSchema }])],
  providers: [UpdateActionsService, UpdateActionProvider],
  controllers: [UpdateActionsController],
})
export class UpdateActionsModule {}
