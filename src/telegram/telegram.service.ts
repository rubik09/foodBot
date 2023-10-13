import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ButtonService } from '../button/button.service';
import { Message } from 'node-telegram-bot-api';
import { langMap } from '../utils/telegram.constants';
import TelegramBot = require('node-telegram-bot-api');
import languageService from '../language/language.service';
import { ConfigService } from '@nestjs/config';
import { botInternationalMessages } from '../utils/messages';
import { actionsMap } from '../utils/telegram.constants';
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: TelegramBot;
  constructor(
    private readonly buttonService: ButtonService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    this.bot = new TelegramBot(this.configService.get('app-config.BOT_TOKEN'), { polling: true });
  }

  async increaseState(userTelegramId: number) {
    let userData = await this.userService.getUser(userTelegramId);
    let path = await this.buttonService.correctPath(userData.state, true);
    await this.userService.saveState(userTelegramId, path);
  }

  async sendLangKeyboard(userTelegramId: number) {
    const markup: TelegramBot.ReplyKeyboardMarkup = {
      keyboard: [
        [{ text: 'Русский' }, { text: 'English' }, { text: 'Portuguesa' }],
        [{ text: 'Español' }, { text: 'Français' }],
      ],
      one_time_keyboard: true,
      resize_keyboard: true,
    };
    this.bot.sendMessage(userTelegramId, botInternationalMessages.choseLanguage, {
      reply_markup: markup,
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

  async returnMainMenu(userTelegramId: number) {
    const userData = await this.userService.getUser(userTelegramId);
    await this.userService.saveState(userTelegramId, '');
    const buttons = await this.buttonService.findButtonsByPath('', userData.language);
    const lang = userData.language;
    this.bot.sendMessage(userTelegramId, languageService.greetingMap.get(lang), {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async begin(msg: Message) {
    await this.returnMainMenu(msg.from.id);
  }

  async back(msg: Message, lang: string) {
    const userTelegramId = msg.from.id;
    try {
      let userData = await this.userService.getUser(userTelegramId);
      let path = await this.buttonService.correctPath(userData.state);
      userData = await this.userService.saveState(userTelegramId, path);
      const buttons = await this.buttonService.findButtonsByPath(userData.state, lang);
      const buttonPrev = await this.buttonService.getButton(userData.state, lang);
      this.sendMessageAndKeyboard(userTelegramId, buttonPrev?.text || languageService.greetingMap.get(lang), buttons);
    } catch (error) {
      console.error(error);
      this.returnMainMenu(userTelegramId);
    }
  }

  async support(msg: Message, lang: string) {
    const userTelegramId = msg.from.id;
    await this.increaseState(userTelegramId);
    const back = languageService.getActionByLangAndType(lang, actionsMap.back.actionName);
    const begin = languageService.getActionByLangAndType(lang, actionsMap.begin.actionName);
    const support = languageService.getActionByLangAndType(lang, actionsMap.support.actionName);
    const buttons = await this.buttonService.addButtonsToKeyboard([begin.button, back.button], 1);
    this.sendMessageAndKeyboard(userTelegramId, support.text, buttons);
  }

  async greeting(msg: Message, lang: string) {
    const userTelegramId = msg.from.id;
    await this.increaseState(userTelegramId);
    const back = languageService.getActionByLangAndType(lang, actionsMap.back.actionName);
    const begin = languageService.getActionByLangAndType(lang, actionsMap.begin.actionName);
    const greeting = languageService.getActionByLangAndType(lang, actionsMap.greeting.actionName);
    const buttons = await this.buttonService.addButtonsToKeyboard([begin.button, back.button], 1);
    this.sendMessageAndKeyboard(userTelegramId, greeting.text, buttons);
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
      const message = msg?.text?.toString();
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
          this.bot.sendMessage(userTelegramId, botInternationalMessages.notFoundLang);
          return await this.sendLangKeyboard(userTelegramId);
        }
      }

      const newMainActions = languageService.getActionsByLang(userData.language);
      const foundAction = newMainActions.find((action) => action?.button === message);
      if (foundAction) {
        try {
          switch (foundAction.type) {
            case actionsMap.back.actionName:
              this.back(msg, userData.language);
              return;
            case actionsMap.begin.actionName:
              this.begin(msg);
              return;
            case actionsMap.support.actionName:
              this.support(msg, userData.language);
              return;
            case actionsMap.greeting.actionName:
              this.greeting(msg, userData.language);
              return;
          }
        } catch (error) {
          console.error(error);
        }
      }
      try {
        const currentButtons = await this.buttonService.getButtonsByPath(userData.state, userData.language);
        const targetButton = currentButtons.find((item) => item.button === message);

        if (targetButton) {
          const { path, text } = targetButton;
          await this.userService.saveState(userTelegramId, path);
          const buttons = await this.buttonService.findButtonsByPath(path, userData.language);
          this.sendMessageAndKeyboard(userTelegramId, text, buttons);
        } else {
          this.returnMainMenu(userTelegramId);
        }
      } catch (error) {
        console.error(error);
        this.returnMainMenu(userTelegramId);
      }
    });
  }
  async onModuleInit() {
    await this.handleUpdates();
    this.logger.log('Bot started successfully');
  }
}
