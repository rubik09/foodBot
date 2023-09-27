import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateController } from './update.controller';
import { UpdateService } from './update.service';
import { Button, ButtonSchema } from 'src/schemas/button.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Button.name, schema: ButtonSchema }])],
  controllers: [UpdateController],
  providers: [UpdateService],
})
export class UpdateModule {}
