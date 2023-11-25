import { Module, forwardRef } from '@nestjs/common';
import { OrderModule } from 'src/telegram/order/order.module';
import { UserModule } from 'src/telegram/user/user.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [forwardRef(() => OrderModule), forwardRef(() => UserModule)],
  exports: [ApiService],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
