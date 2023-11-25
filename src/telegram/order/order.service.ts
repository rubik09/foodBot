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

  async getNextWeek(userTelegramId: number, dates: string[]): Promise<Order[] | null> {
    return await this.orderModel.find({ userTelegramId, date: { $in: dates } });
  }

  async getByDate(today: string): Promise<Order[] | null> {
    return await this.orderModel
      .find({
        date: today,
      })
      .exec();
  }

  async del(userTelegramId: number, datesToDelete: string[]): Promise<any> {
    return await this.orderModel.deleteMany({ userTelegramId, date: { $in: datesToDelete } });
  }
  async getByOrderType(orderType: string): Promise<Order[] | null> {
    return await this.orderModel.find({ orderType });
  }

  async createDailyMenuPoll(order: any) {
    const options = [];
    if (order.salad) {
      options.push(order.salad);
      options.push(`${order.salad} x2`);
    }
    if (order.soup) {
      options.push(order.soup);
      options.push(`${order.soup} x2`);
    }
    if (order.hotDish1) {
      options.push(order.hotDish1);
      options.push(`${order.hotDish1} x2`);
    }
    if (order.hotDish2) {
      options.push(order.hotDish2);
      options.push(`${order.hotDish2} x2`);
    }
    if (order.hotDish3) {
      options.push(order.hotDish3);
      options.push(`${order.hotDish3} x2`);
    }
    return options;
  }
}
