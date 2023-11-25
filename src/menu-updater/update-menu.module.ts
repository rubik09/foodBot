import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateMenuService } from './update-menu.service';
import { UpdateMenuController } from './update-menu.controller';
import { Menu, MenuSchema } from '../schemas/menu.schema';
import { UpdateMenuProvider } from './update-menu.provider';

@Module({
  exports: [UpdateMenuService, UpdateMenuProvider],
  imports: [MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }])],
  providers: [UpdateMenuService, UpdateMenuProvider],
  controllers: [UpdateMenuController],
})
export class UpdateMenuModule {}
