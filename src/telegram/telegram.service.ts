import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ButtonService } from '../button/button.service';
import { Message } from 'node-telegram-bot-api';
import { MainActions, langMap } from '../utils/telegram.constants';
import TelegramBot = require('node-telegram-bot-api');
import languageService from 'src/lang';
@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor(private readonly buttonService: ButtonService, private readonly userService: UserService) {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
  }

  async increaseState(userTelegramId: number) {
    let userData = await this.userService.getUser(userTelegramId);
    let path = await this.buttonService.correctPath(userData.state, true);
    await this.userService.saveState(userTelegramId, path);
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

  async begin(msg: Message, lang: string) {
    await this.userService.saveState(msg.from.id, '');
    await this.returnMainMenu(msg.from.id);
  }

  async back(msg: Message, lang: string) {
    const userTelegramId = msg.from.id;
    try {
      let userData = await this.userService.getUser(userTelegramId);
      let path = await this.buttonService.correctPath(userData.state);
      userData = await this.userService.saveState(userTelegramId, path);
      const buttons = await this.buttonService.findButtonsByPath(userData.state, lang);
      const buttonPrev = await this.buttonService.getButton(userData.state);
      this.sendMessageAndKeyboard(userTelegramId, buttonPrev?.text || '⬇️Выберите нужный раздел⬇️', buttons);
    } catch (error) {
      console.error(error);
      this.returnMainMenu(userTelegramId);
    }
  }

  async support(msg: Message, lang: string) {
    const userTelegramId = msg.from.id;
    await this.increaseState(userTelegramId);
    const back = languageService.getActionByLangAndType(lang, 'back');
    const begin = languageService.getActionByLangAndType(lang, 'begin');
    const support = languageService.getActionByLangAndType(lang, 'support');
    const buttons = await this.buttonService.addButtonsToKeyboard([begin.button, back.button], 1); // type begin, type back (button.button)
    this.sendMessageAndKeyboard(userTelegramId, support.text, buttons);
  }

  async greeting(msg: Message, lang: string) {
    const userTelegramId = msg.from.id;
    await this.increaseState(userTelegramId);
    const back = languageService.getActionByLangAndType(lang, 'back');
    const begin = languageService.getActionByLangAndType(lang, 'begin');
    const greeting = languageService.getActionByLangAndType(lang, 'greeting');
    const buttons = await this.buttonService.addButtonsToKeyboard([begin.button, back.button], 1);
    this.sendMessageAndKeyboard(userTelegramId, greeting.text, buttons); //greeting text
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

      const newMainActions = languageService.getActionsByLang(userData.language);
      const foundAction = newMainActions.find((action) => action?.button === message);
      if (foundAction) {
        try {
          const type: string = foundAction.type;
          //@ts-ignore
          await MainActions[type]?.call(this, msg, userData.language);
          return;
        } catch (error) {
          throw new Error(error);
        }
      }
      try {
        let button = await this.buttonService.getButtonByName(message);
        if (button) {
          const { text, path } = button;
          await this.userService.saveState(userTelegramId, path);
          const buttons = await this.buttonService.findButtonsByPath(path, userData.language);
          this.sendMessageAndKeyboard(msg.from.id, text, buttons);
        }
      } catch (error) {
        console.error(error);
        this.returnMainMenu(userTelegramId);
      }
    });
  }
}
