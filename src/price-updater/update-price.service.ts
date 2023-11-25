import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import load from './parser';
import { googleApiService } from '../utils/googleApi/api';
import { httpResponceMessages } from '../utils/messages';
import { UpdatePriceProvider } from './update-price.provider';
import { Price } from 'src/schemas/price.schema';
import { PriceEntries } from '../telegram/telegram.constants';

@Injectable()
export class UpdatePriceService implements OnModuleInit {
  private readonly logger = new Logger(UpdatePriceService.name);

  constructor(private updatePriceProvider: UpdatePriceProvider) {}

  async loadActions() {
    await googleApiService.init();
    const res = await load(2);
    await this.updatePriceProvider.removeAllPrices();
    await this.updatePriceProvider.uploadPrice(res);
    return JSON.stringify({ message: httpResponceMessages.success });
  }
  async getPrices(): Promise<Price[]> {
    const result = await this.updatePriceProvider.getPrices();
    return result;
  }

  async getPricesEntries(): Promise<PriceEntries> {
    const prices: Price[] = await this.getPrices();

    const priceEntries = Object.entries(prices)[0][1];
    return {
      soup: priceEntries.soupPrice,
      hotDish: priceEntries.hotDishPrice,
      salad: priceEntries.saladPrice,
    } as PriceEntries;
  }

  async onModuleInit() {
    try {
      await googleApiService.init();
      const res = await load(2);
      await this.updatePriceProvider.removeAllPrices();
      await this.updatePriceProvider.uploadPrice(res);
    } catch {
      throw new Error("Can't load action buttons");
    }
  }
}
