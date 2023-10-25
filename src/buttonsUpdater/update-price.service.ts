import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import load from './parser';
import { googleApiService } from '../utils/googleApi/api';
import { httpResponceMessages } from '../utils/messages';
import { UpdatePriceProvider } from './update-price.provider';

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
  async getPrices () {
    const result = await this.updatePriceProvider.getPrices();
    return result;
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
