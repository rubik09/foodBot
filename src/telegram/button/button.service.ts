import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Button } from './button.model';

@Injectable()
export class ButtonService {
  constructor(@InjectModel('Button') private readonly buttonModel: Model<Button>) {}

  async getButton(path: string): Promise<Button | null> {
    return await this.buttonModel.findOne({ path });
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

  async correctPath(path: string = ''): Promise<string> {
    if (path.length <= 2) {
      return '';
    } else {
      const newPath = await path.slice(0, path.length - 3);
      return newPath;
    }
  }

  async findButtonsByPath(path: string): Promise<{ text: string }[][]> {
    const mainActions = [
      {
        back: {
          button: 'Назад',
          action: 'back',
        },
      },
      {
        support: {
          button: 'Написать в поддержку',
          action: 'support',
        },
      },
      {
        greeting: {
          button: 'Спасибо, что помогли',
          action: 'greeting',
        },
      },
      {
        begin: {
          button: 'В начало',
          action: 'begin',
        },
      },
    ];

    const regex = await this.generateRegex(path);
    const buttons = await this.buttonModel.find({ path: { $regex: regex } }).exec();

    const buttonArray = buttons.map((item) => item.button);
    if (buttonArray.includes('{{mainActions}}')) {
      const mainButtons = mainActions.map((item) => Object.values(item)[0].button);
      buttonArray.pop();
      buttonArray.push(...mainButtons);
    }
    if (buttonArray.includes('{{back}}')) {
      const index = buttonArray.indexOf('{{back}}');
      buttonArray[index] = mainActions[0].back.button;
    }
    if (buttonArray.includes('{{support}}')) {
      const index = buttonArray.indexOf('{{support}}');
      buttonArray[index] = 'Написать в поддержку';
    }
    const result = await this.addButtonsToKeyboard(buttonArray, 1);
    return result;
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
