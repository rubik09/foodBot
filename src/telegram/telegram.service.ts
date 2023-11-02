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
import { UpdatePriceService } from 'src/buttonsUpdater/update-price.service';
import { chownSync, stat } from 'fs';
import { weekDays } from './telegram.constants';
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: TelegramBot;
  constructor(
    private readonly updateMenuService: UpdateMenuService,
    private readonly updatePricesService: UpdatePriceService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    this.bot = new TelegramBot(this.configService.get('app-config.BOT_TOKEN'), { polling: true });
  }

  async sendMainKeyboard(userTelegramId: number) {
    const markup: TelegramBot.ReplyKeyboardMarkup = {
      keyboard: [
        [{ text: 'Офис (Пека дапчевича)' }],
        [{ text: 'Доставка (минимальный заказ 4500)' }],
        [{ text: 'Елизмо' }],
        [{ text: 'Альфалидс' }],
      ],
      one_time_keyboard: true,
      resize_keyboard: true,
    };
    await this.userService.saveState(userTelegramId, 'start');
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

  async formatMenu(menuData: any[]) {
    const mapa = {
      weekDay: 'День недели',
      soup: 'Суп',
      hotDish1: 'Горячее 1',
      hotDish2: 'Горячее 2',
      hotDish3: 'Горячее 3',
      salad: 'Салат',
    };
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
  async getMenuArray() {
    const menuDb = await this.updateMenuService.getMenu();
    const menuAr: any[] = [];
    Object.values(menuDb).map((item) => menuAr.push(item));
    return menuAr;
  }

  async showMenu() {
    const menuAr = await this.getMenuArray();
    const formattedMenu = await this.formatMenu(menuAr);
    const newMenu = await this.printMenuForDay(formattedMenu);
    return newMenu;
  }
  async createDailyMenuPoll(chatId: number, order: any) {
    const options = [];
    if (order.salad) {
      options.push(order.salad);
      options.push(`${order.salad} x2`);
    }
    if (order.soup) {
      options.push(order.soup);
      options.push(`${order.soup} x2`);
    }
    if (order.hotDish1) {
      options.push(order.hotDish1);
      options.push(`${order.hotDish1} x2`);
    }
    if (order.hotDish2) {
      options.push(order.hotDish2);
      options.push(`${order.hotDish2} x2`);
    }
    if (order.hotDish3) {
      options.push(order.hotDish3);
      options.push(`${order.hotDish3} x2`);
    }

    const mmm = await this.bot.sendPoll(chatId, order.weekDay, options, {
      allows_multiple_answers: true,
      is_anonymous: false,
    });
  }

  async makeAllWeekPolls(chatId: number, days: number[]) {
    const orders = await this.getMenuArray();
    // orders.forEach(async (item) => {
    //   await this.createDailyMenuPoll(chatId, item);
    // });
    for (let i = 0; i <= orders.length; i++) {
      if (days.includes(i)) {
        await this.createDailyMenuPoll(chatId, orders[i]);
      }
    }
  }

  async startOrder(msg: Message) {
    const mmm = await this.bot.sendPoll(msg.from.id, 'Выбери день', weekDays, {
      allows_multiple_answers: true,
      is_anonymous: false,
    });
    this.userService.savePollId(msg.from.id, mmm.message_id);
    return 'done';
  }
  async showPrices() {
    const prices: Record<string, any> = await this.updatePricesService.getPrices();

    const priceEntries = Object.entries(prices)[0][1];

    const soupPrice = priceEntries.soupPrice;
    const hotDishPrice = priceEntries.hotDishPrice;
    const saladPrice = priceEntries.saladPrice;

    const pricesObject = {
      Суп: soupPrice,
      Горячее: hotDishPrice,
      Салат: saladPrice,
    };

    const priceString = Object.entries(pricesObject)
      .map(([category, price]) => `${category}: ${price}`)
      .join('\n');

    return priceString;
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
    return arr.findIndex((item) => item.text1 === message);
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
        await this.sendMainKeyboard(userTelegramId);
      }
    });

    this.bot.on('poll_answer', async (msg: TelegramBot.PollAnswer) => {
      const pollId = await this.userService.getPollId(msg.user.id);
      if (!pollId) return;
      const days: string[] = [];
      msg.option_ids.forEach((day) => {
        days.push(` ${day}`);
      });
      await this.bot.sendMessage(msg.user.id, `Вы выбрали: ${days}`);
      await this.userService.saveOrderDays(msg.user.id, days);
      await this.bot.stopPoll(msg.user.id, pollId);
      await this.userService.updatePollId(msg.user.id);
      await this.makeAllWeekPolls(msg.user.id, msg.option_ids);
    });

    this.bot.on('message', async (msg: Message) => {
      const enum Steps {
        menu = 'Посмотреть меню',
        prices = 'Наши цены',
        order = 'Cделать заказ',
      }

      type SecondStepButtons = {
        [key in Steps]: (msg: Message) => Promise<string>;
      };

      const secondStepButtons: SecondStepButtons = {
        [Steps.menu]: this.showMenu.bind(this),
        [Steps.prices]: this.showPrices.bind(this),
        [Steps.order]: this.startOrder.bind(this),
      };

      type SecondStep = {
        menu: {
          text: string;
          state: string;
        };
        price: {
          text: string;
          state: string;
        };
        order: {
          text: string;
          state: string;
        };
      };
      const message = msg?.text?.toString();
      const userTelegramId = msg.from.id;

      const secondStep: SecondStep = {
        menu: {
          text: 'Посмотреть меню',
          state: 'menu',
        },
        price: {
          text: 'Наши цены',
          state: 'prices',
        },
        order: {
          text: 'Cделать заказ',
          state: 'order',
        },
      };
      const mainActionsButtons = ['Назад', 'В начало'];

      const userData = await this.userService.getUser(userTelegramId);
      if (!userData) return;
      const date = new Date();
      const zzz = date.getDay();
      if (zzz === 0) {
        await this.bot.sendMessage(userTelegramId, 'Заказаы можно делать пятница суббота');
        await this.sendMainKeyboard(userTelegramId);
        return;
      }
      if (message === 'Назад') {
        if (userData.state === 'menu' || userData.state === 'prices') {
          const userOrderType: string = await this.userService.getOrderType(userTelegramId);
          const findMessage = mainMessages.findIndex((item) => item.orderType === userOrderType);
          if (findMessage < 0) {
            await this.sendMainKeyboard(userTelegramId);
            return;
          }
          const buttons = await this.addButtonsToKeyboard(
            Object.keys(secondStepButtons).map((item) => item),
            1,
          );
          await this.sendMessageAndKeyboard(userTelegramId, mainMessages[findMessage].text2, buttons);
          await this.userService.saveState(userTelegramId, 'orderType');
          return;
        }
      }

      if (message === 'В начало') {
        await this.sendMainKeyboard(userTelegramId);
        return;
      }
      if (userData.state === 'start') {
        const findMessage = await this.findMessageIndex(mainMessages, message);
        console.log(findMessage);
        if (findMessage < 0) {
          await this.sendMainKeyboard(userTelegramId);
          return;
        }
        const buttons = await this.addButtonsToKeyboard(
          Object.keys(secondStepButtons).map((item) => item),
          1,
        );
        await this.sendMessageAndKeyboard(userTelegramId, mainMessages[findMessage].text2, buttons);
        await this.userService.saveOrderType(userTelegramId, mainMessages[findMessage].orderType);
        await this.userService.saveState(userTelegramId, 'orderType');
        return;
      }
      if (userData.state === 'orderType') {
        const findMessageIndex: string = Object.keys(secondStepButtons).find((item) => item === message);
        if (!findMessageIndex) {
          await this.userService.saveState(userTelegramId, 'start');
          await this.sendMainKeyboard(userTelegramId);
          return;
        }
        const messageSecondStep = await secondStepButtons[findMessageIndex as Steps](msg);
        const buttons = await this.addButtonsToKeyboard(mainActionsButtons, 2);
        const foundState = Object.values(secondStep).find((item) => item.text === message)?.state;
        await this.userService.saveState(userTelegramId, foundState);
        if (foundState === 'order') return;
        await this.sendMessageAndKeyboard(userTelegramId, messageSecondStep, buttons);
      }
      if (userData.state === 'order') {
      }
    });
  }
  async onModuleInit() {
    await this.handleUpdates();
    this.logger.log('Bot started successfully');
  }
}
