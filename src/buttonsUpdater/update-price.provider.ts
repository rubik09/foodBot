import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Price } from 'src/schemas/price.schema';

@Injectable()
export class UpdatePriceProvider {
  constructor(@InjectModel(Price.name) private priceModel: Model<Price>) {}
  async removeAllMenu() {
    await this.priceModel.deleteMany();
  }
  async uploadMenu(price: Price[]) {
    await this.priceModel.insertMany(price);
  }
  async getMenuPosition() {
    return await this.priceModel.find();
  }
}
