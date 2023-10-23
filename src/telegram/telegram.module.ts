import { Module, forwardRef } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, Orderchema } from '../schemas/order.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { TelegramService } from './telegram.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: Orderchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => OrderModule)
  ],
  controllers: [TelegramController],
  providers: [TelegramService]
})
export class TelegramModule {}