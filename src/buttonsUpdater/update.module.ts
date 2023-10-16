import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateController } from './update.controller';
import { UpdateService } from './update.service';
import { Button, ButtonSchema } from '../schemas/button.schema';
import { UpdateProvider } from './update.provider';

@Module({
  imports: [MongooseModule.forFeature([{ name: Button.name, schema: ButtonSchema }])],
  controllers: [UpdateController],
  providers: [UpdateService,UpdateProvider],
})
export class UpdateModule {}
