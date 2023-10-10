import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ButtonService } from './button.service';
import { Button, ButtonSchema } from '../schemas/button.schema';


@Module({  imports: [
  MongooseModule.forFeature([{ name: Button.name, schema: ButtonSchema }]),
],
  providers: [ButtonService],
  exports: [ButtonService]
})
export class ButtonModule {}
