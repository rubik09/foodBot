import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ButtonService } from '../button/button.service';
import { Message } from 'node-telegram-bot-api';
import TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor(private readonly buttonService: ButtonService,private readonly userService: UserService,) {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
  }

  async sendLangKeyboard(userTelegramId: number) {
    this.bot.sendMessage(userTelegramId, 'Choose your language:', {
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

  async sendMessageAndKeyboard(userTelegramId: number, text: string, buttons: { text: string }[][]) {
    this.bot.sendMessage(userTelegramId, text, {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async returnMainMenu(userTelegramId: number, text: string = '⬇️Выберите нужный раздел⬇️') {
    const userData = await this.userService.getUser(userTelegramId);
    const buttons = await this.buttonService.findButtonsByPath('', userData.language);
    this.bot.sendMessage(userTelegramId, text, {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async begin(msg: Message) {
    await this.userService.saveState(msg.from.id, '');
    await this.returnMainMenu(msg.from.id);
  }

  async back(msg: Message) {
    const userTelegramId = msg.from.id; 
    try{
    let userData = await this.userService.getUser(userTelegramId);
    let path = await this.buttonService.correctPath(userData.state);
    userData = await this.userService.saveState(userTelegramId, path);
    const buttons = await this.buttonService.findButtonsByPath(userData.state, userData.language);
    const buttonPrev = await this.buttonService.getButton(userData.state);
    this.sendMessageAndKeyboard(userTelegramId, buttonPrev?.text || '⬇️Выберите нужный раздел⬇️', buttons);
  }
  catch(error){
      console.error(error)
      this.returnMainMenu(userTelegramId)
    }
  }

  async support(msg: Message) {
    const userTelegramId = msg.from.id;
    const buttons = await this.buttonService.addButtonsToKeyboard(['В начало'], 1);
    this.sendMessageAndKeyboard(
      userTelegramId,
      'Наш самый ТОПовый менеджер готов помочь вам здесь - @official_kk_1win',
      buttons,
    );
  }

  async greeting(msg: Message) {
    const userTelegramId = msg.from.id;
    const buttons = await this.buttonService.addButtonsToKeyboard(['В начало'], 1);
    this.sendMessageAndKeyboard(userTelegramId, 'Спасибо, что обратились к нам!\nЖелаем удачных ставок🖤', buttons);
  }

  async handleUpdates(): Promise<void> {
    this.bot.onText(/\/start/, async (msg: any) => {
      const userTelegramId = msg.from.id;
      const user = await this.userService.getUser(userTelegramId);
      if (!user) {
        const username = msg.from.username || '';
        await this.userService.createUser(userTelegramId, username);
        await this.sendLangKeyboard(userTelegramId);
      }
    });

    this.bot.on('message', async (msg: Message) => {
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
        Русский: 'ru',
        English: 'en',
      };
      const message = msg.text.toString();
      const userTelegramId = msg.from.id;

      const userData = await this.userService.getUser(userTelegramId);
      if (!userData) return;

      if (userData.state === 'lang') {
        if (langMap[message as keyof typeof langMap]) {
          const langCode = langMap[message as keyof typeof langMap];
          await this.userService.saveLanguage(userTelegramId, langCode);
          this.bot.sendMessage(userTelegramId, `${message} ✅`);
          return await this.returnMainMenu(userTelegramId);
        } else {
          this.bot.sendMessage(userTelegramId, `Language not found🚫`);
          return await this.sendLangKeyboard(userTelegramId);
        }
      }

      const foundAction = mainActions.find((action) => Object.values(action)[0]?.button === message);
      if (foundAction) {
        //@ts-ignore
        await foundAction[Object.keys(foundAction)].action(msg);
        return;
      }
      try {
      let button = await this.buttonService.getButtonByName(message);

      if (button) {
        const { text, path } = button;
        await this.userService.saveState(userTelegramId, path);
        const buttons = await this.buttonService.findButtonsByPath(path, userData.language);
        this.sendMessageAndKeyboard(msg.from.id, text, buttons);
      }
    }
    catch(error){
        console.error(error)
        this.returnMainMenu(userTelegramId)
      }
    });
  }
}
