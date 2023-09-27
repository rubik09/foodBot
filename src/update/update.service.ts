import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import loadBtns from './parser/parser';
import langMap from 'src/lang';
import errors from './parser/errors';
import { Button } from 'src/schemas/button.schema';

@Injectable()
export class UpdateService {
  constructor(@InjectModel(Button.name) private buttonModel: Model<Button>) {}

  async updateBotStructure(lang: string | string[] | undefined) {
    if (typeof lang === 'string') {
      if (!langMap.has(lang)) throw new Error(JSON.stringify(errors.wrongLang));
      else {
        const res = await loadBtns(langMap.get(lang));
        await this.buttonModel.deleteMany();
        await this.buttonModel.insertMany(res);
        return JSON.stringify({ msg: 'success update' });
      }
    } else {
      return JSON.stringify({
        message: 'please provide language, route for updating all or several languages, will be implemented soon',
      });
    }
  }

  async findAll(): Promise<Button[]> {
    return this.buttonModel.find().exec();
  }
}
