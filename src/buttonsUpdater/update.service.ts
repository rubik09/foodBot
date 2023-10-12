import { Model } from 'mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import loadBtns from './parser';
import languageService from '../language/language.service';
import errors from '../utils/googleApi/errors';
import { Button } from '../schemas/button.schema';
import { googleApiService } from '../utils/googleApi/api';
import { httpResponceMessages } from '../utils/messages';

const langMap = languageService.langMap;
@Injectable()
export class UpdateService implements OnModuleInit {
  private readonly logger = new Logger(UpdateService.name);

  constructor(@InjectModel(Button.name) private buttonModel: Model<Button>) {}

  private async updateAllLangs() {
    await this.buttonModel.deleteMany();
    for (let [key, value] of languageService.langMap) {
      const res = await loadBtns(value);
      res.forEach((el) => (el.language = key));
      await this.buttonModel.insertMany(res);
      this.logger.log(`Loaded language ${key}`);
    }
  }

  async updateBotStructure(langData: string) {
    const langs = langData.split(',');
    langs.forEach((lang) => {
      if (!langMap.has(lang)) throw new Error(JSON.stringify(errors.wrongLang.text));
    });
    for (let lang of langs) {
      const res = await loadBtns(langMap.get(lang));
      res.forEach((el) => (el.language = lang));
      await this.buttonModel.deleteMany({ language: lang });
      await this.buttonModel.insertMany(res);
      this.logger.log(`Language ${lang} loaded`);
    }
    return JSON.stringify({ messages: httpResponceMessages.success });
  }

  async onModuleInit() {
    await googleApiService.init();
    const langs = (await googleApiService.getPageNames()).map((el) => el.toLowerCase().slice(1, -1));
    langs.forEach((lang, idx) => languageService.langMap.set(lang, idx));
  }
  async findAll(): Promise<any> {
    const res = await googleApiService.getPageHeaders(0);
    return res;
  }
}
