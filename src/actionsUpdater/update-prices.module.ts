import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateActionsService } from './update-prices.service';
import { UpdateActionsController } from './update-prices.controller';
import { Menu, MenuSchema } from '../schemas/menu.schema';
import { UpdateActionProvider } from './update-prices.provider';

@Module({
  imports: [MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }])],
  providers: [UpdateActionsService, UpdateActionProvider],
  controllers: [UpdateActionsController],
})
export class UpdatePricesModule {}
