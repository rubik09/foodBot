import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from 'src/telegram/order/order.service';
import { UserService } from 'src/telegram/user/user.service';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  constructor(private readonly orderService: OrderService, private readonly userService: UserService) {}

  async getOrdersByType(data: string) {
    const result = await this.orderService.getByOrderType(data);
    const filteredArray = result.map(({ userTelegramId, salad, soup, hotDish, extra, date, ...rest }) => {
      return { userTelegramId, salad, soup, hotDish, extra, date };
    });
    const promises = filteredArray.map(async ({ userTelegramId, ...rest }) => {
      const fullName = await this.userService.getFullNameById(userTelegramId);
      return { fullName, ...rest };
    });

    const orders = await Promise.all(promises);
    return JSON.stringify({ messages: orders });
  }
}
