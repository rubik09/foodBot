import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { UpdateMenuModule } from 'src/actionsUpdater/update-menu.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => OrderModule),
    forwardRef(() => UpdateMenuModule)
  ],
  providers: [TelegramService]
})
export class TelegramModule {}