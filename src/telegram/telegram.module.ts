import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { UpdateMenuModule } from 'src/menu-updater/update-menu.module';
import { UpdatePriceModule } from 'src/price-updater/update-price.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => OrderModule),
    forwardRef(() => UpdateMenuModule),
    forwardRef(() => UpdatePriceModule),
  ],
  providers: [TelegramService],
})
export class TelegramModule {}
