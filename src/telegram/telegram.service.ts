import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from './user/user.service';
import { OrderService } from './order/order.service';
import { Message } from 'node-telegram-bot-api';
import TelegramBot = require('node-telegram-bot-api');
import { ConfigService } from '@nestjs/config';
import { botMainMessage } from '../utils/messages';
import { MainMessage, mainMessages } from '../utils/telegram.constants';
import { UpdateMenuService } from 'src/actionsUpdater/update-menu.service';
import { UpdateMenuProvider } from '../actionsUpdater/update-menu.provider';
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: TelegramBot;
  constructor(
    private readonly updateMenuService: UpdateMenuService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    this.bot = new TelegramBot(this.configService.get('app-config.BOT_TOKEN'), { polling: true });
  }

  // async increaseState(userTelegramId: number) {
  //   let userData = await this.userService.getUser(userTelegramId);
  //   let path = await this.buttonService.correctPath(userData.state, true);
  //   await this.userService.saveState(userTelegramId, path);
  // }

  async sendMainKeyboard(userTelegramId: number) {
    const markup: TelegramBot.ReplyKeyboardMarkup = {
      keyboard: [
        [{ text: 'Офис (Пека дапчевича)' }],
        [{ text: 'Доставка (минимальный заказ 4500)' }],
        [{ text: 'Елизмо' }],
        [{ text: 'Альфалидс' }]
      ],
      one_time_keyboard: true,
      resize_keyboard: true,
    };
    this.bot.sendMessage(userTelegramId, botMainMessage.firstMessage, {
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

  async sendImageMessageAndKeyboard(
    userTelegramId: number,
    text: string,
    buttons: { text: string }[][],
    imageLink: string,
  ) {
    this.bot.sendPhoto(userTelegramId, imageLink, {
      caption: text,
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  // async returnMainMenu(userTelegramId: number) {
  //   const userData = await this.userService.getUser(userTelegramId);
  //   await this.userService.saveState(userTelegramId, '');
  //   const buttons = await this.buttonService.findButtonsByPath('', userData.language);
  //   const lang = userData.language;
  //   this.bot.sendPhoto(userTelegramId, greetingImgLinksMap.get(lang) || greetingImageLink, {
  //     caption: languageService.greetingMap.get(lang),
  //     reply_markup: {
  //       keyboard: buttons,
  //       one_time_keyboard: true,
  //       resize_keyboard: true,
  //     },
  //   });
  // }

  // async begin(msg: Message) {
  //   await this.returnMainMenu(msg.from.id);
  // }

  // async back(msg: Message, lang: string) {
  //   const userTelegramId = msg.from.id;
  //   try {
  //     let userData = await this.userService.getUser(userTelegramId);
  //     let path = await this.buttonService.correctPath(userData.state);
  //     userData = await this.userService.saveState(userTelegramId, path);
  //     const buttons = await this.buttonService.findButtonsByPath(userData.state, lang);
  //     const buttonPrev = await this.buttonService.getButton(userData.state, lang);
  //     if (!buttonPrev?.text) {
  //       this.sendMessageAndKeyboard(userTelegramId, languageService.greetingMap.get(lang), buttons);
  //     } else {
  //       if (buttonPrev.imageLink)
  //         this.sendImageMessageAndKeyboard(userTelegramId, buttonPrev.text, buttons, buttonPrev.imageLink);
  //       else this.sendMessageAndKeyboard(userTelegramId, buttonPrev.text, buttons);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     this.returnMainMenu(userTelegramId);
  //   }
  // }

  // async support(msg: Message, lang: string) {
  //   const userTelegramId = msg.from.id;
  //   await this.increaseState(userTelegramId);
  //   const back = languageService.getActionByLangAndType(lang, actionsMap.back.actionName);
  //   const begin = languageService.getActionByLangAndType(lang, actionsMap.begin.actionName);
  //   const support = languageService.getActionByLangAndType(lang, actionsMap.support.actionName);
  //   const buttons = await this.buttonService.addButtonsToKeyboard([begin.button, back.button], 1);
  //   this.sendMessageAndKeyboard(userTelegramId, support.text, buttons);
  // }

  // async greeting(msg: Message, lang: string) {
  //   const userTelegramId = msg.from.id;
  //   await this.increaseState(userTelegramId);
  //   const back = languageService.getActionByLangAndType(lang, actionsMap.back.actionName);
  //   const begin = languageService.getActionByLangAndType(lang, actionsMap.begin.actionName);
  //   const greeting = languageService.getActionByLangAndType(lang, actionsMap.greeting.actionName);
  //   const buttons = await this.buttonService.addButtonsToKeyboard([begin.button, back.button], 1);
  //   this.sendMessageAndKeyboard(userTelegramId, greeting.text, buttons);
  // }

  async formatMenu(menuData: any[]) {
    const mapa = { weekDay: 'День недели',
    soup: 'Суп',
    hotDish1: 'Горячее 1',
    hotDish2: 'Горячее 2',
    hotDish3: 'Горячее 3',
    salad: 'Салат'}
    const formattedMenu = menuData.map((item) => ({
      [mapa.weekDay]: item['weekDay'],
      [mapa.soup]: item['soup'],
      [mapa.hotDish1]: item['hotDish1'],
      [mapa.hotDish2]: item['hotDish2'],
      [mapa.hotDish3]: item['hotDish3'],
      [mapa.salad]: item['salad'],
    }));
  
    return formattedMenu;
  }
  
  async printMenuForDay(dayMenu: any) {
    const result = [];
    for (const day of dayMenu) {
      const formattedDay = Object.entries(day)
        .map(([key, value]) => {
          if (value !== '') {
            return `${key}: ${value}`;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');
      result.push(formattedDay);
    }
    return result.join('\n\n');
  }
  async showMenu () {
    const menuDb = await this.updateMenuService.getMenu();
    const menuAr: any[] = []
    Object.values(menuDb).map(item => menuAr.push(item))

    const formattedMenu = await this.formatMenu(menuAr);
    const newMenu = await this.printMenuForDay(formattedMenu)
    return newMenu;
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
  async findMessageIndex(arr: MainMessage[], message: string) {
    return arr.findIndex(item => item.text1 === message);
  }
  async handleUpdates(): Promise<void> {
    this.bot.onText(/\/start/, async (msg: any) => {
      const userTelegramId = msg.from.id;
      const user = await this.userService.getUser(userTelegramId);
      if (!user) {
        const username = msg.from.username || '';
        await this.userService.createUser(userTelegramId, username);
        await this.sendMainKeyboard(userTelegramId);
      } else {
        await this.userService.saveState(userTelegramId, 'start');
        await this.sendMainKeyboard(userTelegramId);
      } 
    });

    this.bot.on('message', async (msg: Message) => {
      interface SecondStepActions {
        [key: string]: Promise<string>;
      }
      const secondStepActions: SecondStepActions = {
        'Посмотреть меню': this.showMenu(),
        // {
        //   button: 'Заказать обеды на неделю (ДАТЫ)',
        //   action: this.showMenu
        // },
        // {
        //   button: 'Наши цены',
        //   action: this.showMenu
        // }
      }

      const message = msg?.text?.toString();
      const userTelegramId = msg.from.id;

      const userData = await this.userService.getUser(userTelegramId);
      if (!userData) return;
      const userState = await this.userService.getState(userTelegramId);
      // const findMessage = mainMessages.find(item => item.text1 === message);
      if(userState === 'start') {
        const findMessage = await this.findMessageIndex(mainMessages, message);
        console.log(findMessage)
        if(findMessage < 0) {
          await this.sendMainKeyboard(userTelegramId);
          return;
        }
        const buttons = await this.addButtonsToKeyboard(Object.keys(secondStepActions).map(item => item), 1) ;
        await this.sendMessageAndKeyboard(userTelegramId, mainMessages[findMessage].text2, buttons);
        await this.userService.saveOrderType(userTelegramId, mainMessages[findMessage].orderType);
        await this.userService.saveState(userTelegramId, 'orderType');
        return;
      }
      if(userState === 'orderType') {
        const findMessageIndex: string = Object.keys(secondStepActions).find(item => item === message);
        if(!findMessageIndex) {
          await this.userService.saveState(userTelegramId, 'start');
          await this.sendMainKeyboard(userTelegramId);
          return;
        }
        const menu = await secondStepActions[findMessageIndex];
        this.bot.sendMessage(userTelegramId, menu)
        
      }

      // if (userData.state === 'lang') {
      //   if (langMap[message as keyof typeof langMap]) {
      //     const langCode = langMap[message as keyof typeof langMap];
      //     await this.userService.saveLanguage(userTelegramId, langCode);
      //     this.bot.sendMessage(userTelegramId, `${message} ✅`);
      //     return await this.returnMainMenu(userTelegramId);
      //   } else {
      //     this.bot.sendMessage(userTelegramId, botInternationalMessages.notFoundLang);
      //     return await this.sendLangKeyboard(userTelegramId);
      //   }
      // }

      // const newMainActions = languageService.getActionsByLang(userData.language);
      // const foundAction = newMainActions.find((action) => action?.button === message);
      // if (foundAction) {
      //   try {
      //     switch (foundAction.type) {
      //       case actionsMap.back.actionName:
      //         this.back(msg, userData.language);
      //         return;
      //       case actionsMap.begin.actionName:
      //         this.begin(msg);
      //         return;
      //       case actionsMap.support.actionName:
      //         this.support(msg, userData.language);
      //         return;
      //       case actionsMap.greeting.actionName:
      //         this.greeting(msg, userData.language);
      //         return;
      //     }
      //   } catch (error) {
      //     console.error(error);
      //   }
      // }
      // try {
      //   const currentButtons = await this.buttonService.getButtonsByPath(userData.state, userData.language);
      //   const targetButton = currentButtons.find((item) => item.button === message);

      //   if (targetButton) {
      //     const { path, text, imageLink } = targetButton;
      //     await this.userService.saveState(userTelegramId, path);
      //     const buttons = await this.buttonService.findButtonsByPath(path, userData.language);
      //     if (imageLink) {
      //       this.sendImageMessageAndKeyboard(userTelegramId, text, buttons, imageLink);
      //     } else {
      //       this.sendMessageAndKeyboard(userTelegramId, text, buttons);
      //     }
      //   } else {
      //     this.returnMainMenu(userTelegramId);
      //   }
      // } catch (error) {
      //   console.error(error);
      //   this.returnMainMenu(userTelegramId);
      // }
    });
  }
  async onModuleInit() {
    await this.handleUpdates();
    this.logger.log('Bot started successfully');
  }
}
