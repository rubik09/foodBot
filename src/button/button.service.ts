import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Button } from '../schemas/button.schema';
import languageService from 'src/lang';
const lang = languageService.langMap;
const actionsDict = languageService.actionsDict;
@Injectable()
export class ButtonService {
  constructor(@InjectModel('Button') private readonly buttonModel: Model<Button>) {}

  async getButton(path: string, language: string): Promise<Button | null> {
    return await this.buttonModel.findOne({ path, language });
  }
  async getButtonByName(button: string): Promise<Button | null> {
    return await this.buttonModel.findOne({ button });
  }

  async generateRegex(path: string = ''): Promise<RegExp> {
    if (path === '') {
      return /^(0[1-9]|[1-9][0-9])$/;
    } else {
      return new RegExp(`^${path}-\\d{2}$`);
    }
  }

  async correctPath(path: string = '', increase: boolean = false): Promise<string> {
    if (increase) {
      return `${path}-00`;
    }
    if (path.length <= 2) {
      return '';
    } else {
      const newPath = await path.slice(0, path.length - 3);
      return newPath;
    }
  }

  async findButtonsByPath(path: string, language: string): Promise<{ text: string }[][]> {
    const regex = await this.generateRegex(path);
    const buttons = await this.buttonModel
      .find({
        language: language,
        path: { $regex: regex },
      })
      .exec();
    const buttonArray = buttons.map((item) => item.button);
    if (buttonArray.includes('{{mainActions}}')) {
      const mainButtons = languageService.getActionsByLang(language).map((el) => el.button);
      buttonArray.pop();
      buttonArray.push(...mainButtons);
    }
    if (buttonArray.includes('{{back}}')) {
      const index = buttonArray.indexOf('{{back}}');
      buttonArray[index] = actionsDict.get('back')[lang.get(language)].button;
    }
    if (buttonArray.includes('{{support}}')) {
      const index = buttonArray.indexOf('{{support}}');
      buttonArray[index] = actionsDict.get('support')[lang.get(language)].button;
    }
    if (buttonArray.includes('{{begin}}')) {
      const index = buttonArray.indexOf('{{begin}}');
      buttonArray[index] = actionsDict.get('begin')[lang.get(language)].button;
    }
    if (buttonArray.includes('{{greeting}}')) {
      const index = buttonArray.indexOf('{{greeting}}');
      buttonArray[index] = actionsDict.get('greeting')[lang.get(language)].button;
    }
    const result = await this.addButtonsToKeyboard(buttonArray, 1);
    return result;
  }
  async getButtonsByPath(path: string, language: string): Promise<Button[]> {
    const regex = await this.generateRegex(path);
    return await this.buttonModel
      .find({
        language: language,
        path: { $regex: regex },
      })
      .exec();
  }
  async groupBy<T>(items: T[], n: number): Promise<T[][]> {
    const count = Math.ceil(items.length / n);
    const groups: T[][] = Array(count);
    for (let index = 0; index < count; index++) {
      groups[index] = items.slice(index * n, index * n + n);
    }
    return groups;
  }

  async addButtonsToKeyboard(arr: string[], amountButtonsPerLine: number): Promise<{ text: string }[][]> {
    const keyboardButtons = await this.groupBy(
      arr.map((item) => ({ text: item })),
      amountButtonsPerLine,
    );
    return keyboardButtons;
  }
}
