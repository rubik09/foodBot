import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Price } from 'src/schemas/price.schema';

@Injectable()
export class UpdatePriceProvider {
  constructor(@InjectModel(Price.name) private priceModel: Model<Price>) {}
  async removeAllPrices() {
    await this.priceModel.deleteMany();
  }
  async uploadPrice(price: Price[]) {
    await this.priceModel.insertMany(price);
  }
  async getPrices() {
    return await this.priceModel.find();
  }
}
