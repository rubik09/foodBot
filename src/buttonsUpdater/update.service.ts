import { Model } from 'mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import loadBtns from './parser';
import languageService from '../language/language.service';
import errors from '../utils/googleApi/errors';
import { Button } from '../schemas/button.schema';
import { googleApiService } from '../utils/googleApi/api';

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

  async updateBotStructure(lang: string | string[] | undefined) {
    if (typeof lang === 'string') {
      if (!langMap.has(lang)) throw new Error(JSON.stringify(errors.wrongLang.text));
      else {
        const res = await loadBtns(langMap.get(lang));
        res.forEach((el) => (el.language = lang));
        await this.buttonModel.deleteMany({ language: lang });
        await this.buttonModel.insertMany(res);
        return JSON.stringify({ msg: 'success update' });
      }
    } else {
      return JSON.stringify({
        message:
          'please provide language. Route for updating all or several languages, will be implemented soon or not, by safety reasons',
      });
    }
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
