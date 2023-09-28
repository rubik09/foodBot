import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { ButtonService } from './button/button.service';
import TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor(private readonly userService: UserService, private readonly buttonService: ButtonService) {
    this.bot = new TelegramBot('6604969757:AAGbO8j0NY0AzndU7L0DEqiZyga8rH4KEeE', { polling: true });
  }

  async sendLangKeyboard(chatId: number) {
    this.bot.sendMessage(chatId, 'Choose your language:', {
      reply_markup: {
        keyboard: [
          //@ts-ignore
          ['Русский', 'English'],
        ],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async sendMessageAndKeyboard(chatId: number, text: string, buttons: { text: string }[][]) {
    this.bot.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async returnMainMenu(chatId: number, text: string = '⬇️Выберите нужный раздел⬇️') {
    const buttons = await this.buttonService.findButtonsByPath('');
    this.bot.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async begin(msg: any) {
    await this.userService.saveState(msg.from.id, '');
    await this.returnMainMenu(msg.from.id);
  }

  async back(msg: any) {
    const userId = msg.from.id;
    const state = await this.userService.getState(userId);
    let path = await this.buttonService.correctPath(state);
    await this.userService.saveState(userId, path);
    const buttons = await this.buttonService.findButtonsByPath(state);

    const buttonPrev = await this.buttonService.getButton(state);

    this.sendMessageAndKeyboard(userId.toString(), buttonPrev?.button || '⬇️Выберите нужный раздел⬇️', buttons);
  }

  async support(msg: any) {
    const userId = msg.from.id;
    const buttons = await this.buttonService.addButtonsToKeyboard(['В начало', 'Назад'], 1);
    this.sendMessageAndKeyboard(
      userId.toString(),
      'Наш самый ТОПовый менеджер готов помочь вам здесь - @official_kk_1win',
      buttons,
    );
  }

  async greeting(msg: any) {
    const userId = msg.from.id;
    const buttons = await this.buttonService.addButtonsToKeyboard(['В начало'], 1);
    this.sendMessageAndKeyboard(userId.toString(), 'Спасибо, что обратились к нам!\nЖелаем удачных ставок🖤', buttons);
  }

  async handleUpdates(): Promise<void> {
    this.bot.onText(/\/start/, async (msg: any) => {
      const userId = msg.from.id;
      const user = await this.userService.getUser(userId);
      if (!user) {
        const username = msg.from.username || '';
        await this.userService.createUser(userId, username);
        await this.sendLangKeyboard(userId);
      }
    });

    this.bot.on('message', async (msg: any) => {
      const mainActions = [
        {
          back: {
            button: 'Назад',
            action: (msg: any) => this.back(msg),
          },
        },
        {
          support: {
            button: 'Написать в поддержку',
            action: (msg: any) => this.support(msg),
          },
        },
        {
          greeting: {
            button: 'Спасибо, что помогли',
            action: (msg: any) => this.greeting(msg),
          },
        },
        {
          begin: {
            button: 'В начало',
            action: (msg: any) => this.begin(msg),
          },
        },
      ];
      const langMap = {
        Русский: 'geoRu',
        English: 'geoGB',
      };
      const message = msg.text.toString();
      const user = msg.from;

      const userDB = await this.userService.getUser(user.id);
      if (!userDB) return;

      const state = await this.userService.getState(user.id);
      if (state === 'lang') {
        if (langMap[message as keyof typeof langMap]) {
          const langCode = langMap[message as keyof typeof langMap];
          await this.userService.saveLanguage(user.id, langCode);
          this.bot.sendMessage(user.id, `${message} ✅`);
          return await this.returnMainMenu(user.id);
        } else {
          this.bot.sendMessage(user.id, `Language not found🚫`);
          return await this.sendLangKeyboard(user.id);
        }
      }

      const foundAction = mainActions.find((action) => Object.values(action)[0]?.button === message);
      if (foundAction) {
        //@ts-ignore
        await foundAction[Object.keys(foundAction)].action(msg);
        return;
      }

      let button = await this.buttonService.getButtonByName(message);
      if (button) {
        const { text, path } = button;
        await this.userService.saveState(user.id, path);
        const buttons = await this.buttonService.findButtonsByPath(path);
        this.sendMessageAndKeyboard(msg.from.id, text, buttons);
      }
    });
  }
}
