import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import loadBtns from './parser';
import langMap from 'src/lang';
import errors from 'src/utils/googleApi/errors';
import { Button } from 'src/schemas/button.schema';

@Injectable()
export class UpdateService {
  constructor(@InjectModel(Button.name) private buttonModel: Model<Button>) {}

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

  async findAll(): Promise<Button[]> {
    return this.buttonModel.find().exec();
  }
}
