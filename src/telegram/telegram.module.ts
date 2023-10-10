import { Module, forwardRef } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Button, ButtonSchema } from '../schemas/button.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { TelegramService } from './telegram.service';
import { UserModule } from '../user/user.module';
import { ButtonModule } from '../button/button.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Button.name, schema: ButtonSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => ButtonModule)
  ],
  controllers: [TelegramController],
  providers: [TelegramService]
})
export class TelegramModule {}