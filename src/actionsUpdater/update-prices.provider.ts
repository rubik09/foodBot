import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Menu } from '../schemas/menu.schema';

@Injectable()
export class UpdateActionProvider {
  constructor(@InjectModel(Menu.name) private priceModel: Model<Menu>) {}
  async removeAllActions() {
    await this.priceModel.deleteMany();
  }
  async uploadActions(prices: Menu[]) {
    await this.priceModel.insertMany(prices);
  }
  async getActions() {
    return await this.priceModel.find();
  }
}
