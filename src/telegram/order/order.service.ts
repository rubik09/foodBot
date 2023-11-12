import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../../schemas/order.schema';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}
  async saveOrder(order: Order): Promise<Order> {
    return await this.orderModel.create({
      userTelegramId: order.userTelegramId,
      salad: order.salad,
      soup: order.soup,
      hotDish: order.hotDish,
      extra: order.extra,
      orderType: order.orderType,
      date: order.date,
      price: order.price,
    });
  }
  async updateOrder(userTelegramId: number, date: string, extra: string) {
    const filter = { userTelegramId, date };
    const update = { extra: extra };
    return await this.orderModel.findOneAndUpdate(filter, update);
  }
  async get(userTelegramId: number): Promise<Order[] | null> {
    return await this.orderModel.find({ userTelegramId });
  }

  async del(userTelegramId: number, datesToDelete: string[]): Promise<any> {
    return await this.orderModel.deleteMany({ userTelegramId, date: {$in: datesToDelete} });
  }
}
