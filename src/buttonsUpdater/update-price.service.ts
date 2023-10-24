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
    const res = await load(3);
    await this.updatePriceProvider.removeAllMenu();
    await this.updatePriceProvider.uploadMenu(res);
    return JSON.stringify({ message: httpResponceMessages.success });
  }
  async getMenu () {
    const result = await this.updatePriceProvider.getMenuPosition();
    return result;
  }
  async onModuleInit() {
    try {
      await googleApiService.init();
      const res = await load(3);
      await this.updatePriceProvider.removeAllMenu();
      await this.updatePriceProvider.uploadMenu(res);
    } catch {
      throw new Error("Can't load action buttons");
    }
  }

//   async updateBotStructure(langData: string) {
//     const langs = langData.split(',');
//     langs.forEach((lang) => {
//       if (!langMap.has(lang)) throw new Error(JSON.stringify(errors.wrongLang.text));
//     });
//     for (let lang of langs) {
//       const res:Button[] = await loadBtns(langMap.get(lang));
//       res.forEach((el) => (el.language = lang));
//       await this.updatePriceProvider.removeBtnsByLang(lang);
//       await this.updatePriceProvider.uploadBtns(res);
//       this.logger.log(`Language ${lang} loaded`);
//     }
//     return JSON.stringify({ messages: httpResponceMessages.success });
//   }

//   async onModuleInit() {
//     await googleApiService.init();
//     const langs = (await googleApiService.getPageNames()).map((el) => el.toLowerCase().slice(1, -1));
//     langs.forEach((lang, idx) => languageService.langMap.set(lang, idx));
//   }
//   async findAll(): Promise<any> {
//     const res = await googleApiService.getPageHeaders(0);
//     return res;
//   }
}
