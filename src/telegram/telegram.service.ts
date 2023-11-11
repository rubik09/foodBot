import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from './user/user.service';
import { OrderService } from './order/order.service';
import { Message } from 'node-telegram-bot-api';
import TelegramBot = require('node-telegram-bot-api');
import { ConfigService } from '@nestjs/config';
import { botMainMessage } from '../utils/messages';
import { MainMessage, mainMessages } from '../utils/telegram.constants';
import { UpdateMenuService } from '../actionsUpdater/update-menu.service';
import { UpdateMenuProvider } from '../actionsUpdater/update-menu.provider';
import { UpdatePriceService } from '../buttonsUpdater/update-price.service';
import { chownSync, stat } from 'fs';
import { PriceEntries, weekDays } from './telegram.constants';
import { Order } from 'src/schemas/order.schema';
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

  async createDailyMenuPoll(order: any) {
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
    return options;
  }
  async sendDailyMenuPoll(chatId: number, order: any) {
    const options = await this.createDailyMenuPoll(order);
    const mmm = await this.bot.sendPoll(chatId, order.weekDay, options, {
      allows_multiple_answers: true,
      is_anonymous: false,
    });

    this.userService.savePollId(chatId, mmm.message_id);
  }

  async getNextWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const startDayOfWeek = dayOfWeek === 6 || dayOfWeek === 5 ? 1 : dayOfWeek + 1;
    today.setDate(today.getDate() + ((startDayOfWeek - dayOfWeek + 7) % 7));

    const nextWeekDates = [];

    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      nextWeekDates.push(nextDate.toISOString().split('T')[0]);
    }
    return nextWeekDates;
  }

  async processOrderResponse(response: string[], menu: any, orderModel: any) {
    const order = { ...orderModel };
    const prices: PriceEntries = await this.getPrices();
    ['soup', 'hotDish1', 'hotDish2', 'hotDish3', 'salad'].forEach((category) => {
      const dishName = menu[category];
      const dishIndex = response.findIndex((option) => option.startsWith(dishName));
      if (category === 'hotDish1' || category === 'hotDish2' || category === 'hotDish3') category = 'hotDish';
      if (dishIndex !== -1 && dishName !== '') {
        order[category].name = dishName;
        order[category].quantity = response[dishIndex].includes('x2') ? 2 : 1;
        order.price += prices[category] * order[category].quantity;
      } else {
        if (!order[category]) {
          order[category].name = '';
          order[category].quantity = 0;
        }
      }
    });
    return order;
  }

  async saveChoice(chatId: number, msg: TelegramBot.PollAnswer) {
    const choice = msg.option_ids;

    const nextWeekDates = await this.getNextWeekDates();
    const orders = await this.getMenuArray();
    const state = await this.userService.getState(msg.user.id);
    const options = await this.createDailyMenuPoll(orders[Number(state)]);
    const food: string[] = [];
    choice.forEach((nu) => {
      food.push(options[nu]);
    });
    const buttons = await this.addButtonsToKeyboard(['Да', 'Нет'], 2);
    await this.sendMessageAndKeyboard(chatId, 'Дополнения?', buttons);

    const orderModel = {
      userTelegramId: msg.user.id,
      fullName: `${msg.user.first_name || ''} ${msg.user.last_name || ''}`,
      salad: { name: '', quantity: 0 },
      soup: { name: '', quantity: 0 },
      hotDish: { name: '', quantity: 0 },
      extra: '',
      orderType: await this.userService.getOrderType(msg.user.id),
      date: nextWeekDates[Number(state)],
      price: 0,
    };

    const processedOrder = await this.processOrderResponse(food, orders[Number(state)], orderModel);

    await this.orderService.saveOrder(processedOrder);
  }

  async makeAllWeekPolls(chatId: number, day: number) {
    const orders = await this.getMenuArray();
    await this.userService.saveState(chatId, `${day}`);
    await this.sendDailyMenuPoll(chatId, orders[day]);
  }

  async startOrder(msg: Message) {
    const userTelegramId = msg.from.id;
    const orderDone = await this.userService.getOrderDone(userTelegramId);
    if (orderDone) {
      this.bot.sendMessage(
        userTelegramId,
        'Ваш заказ сформирован, если вы хотите сбросить текущий заказ, то воспользуйтесь командой \n/delete_order',
      );
      return;
    }
    if (await this.orderService.get(msg.chat.id)) {
      await this.orderService.del(userTelegramId);
    }
    const mmm = await this.bot.sendPoll(userTelegramId, 'Выбери день', weekDays, {
      allows_multiple_answers: true,
      is_anonymous: false,
    });
    this.userService.savePollId(msg.from.id, mmm.message_id);
    return 'done';
  }
  async getPrices() {
    const prices: Record<string, any> = await this.updatePricesService.getPrices();

    const priceEntries = Object.entries(prices)[0][1];
    return {
      soup: priceEntries.soupPrice,
      hotDish: priceEntries.hotDishPrice,
      salad: priceEntries.saladPrice,
    } as PriceEntries;
  }

  async showPrices() {
    const prices: PriceEntries = await this.getPrices();
    const pricesObject = {
      Суп: prices.soup,
      Горячее: prices.hotDish,
      Салат: prices.salad,
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

  async confirmation(userTelegramId: number) {
    await this.userService.saveState(userTelegramId, 'confirm');
    const buttons = await this.addButtonsToKeyboard(['Да, конечно', 'Нет, начать заново'], 1);
    const orders = await this.getAllOrders(userTelegramId);
    if (orders === 'Заказ должен быть больше 4500') {
      await this.userService.saveState(userTelegramId, 'start');
      await this.bot.sendMessage(userTelegramId, orders);
      await this.bot.sendMessage(userTelegramId, 'Начните составление заказа заново');
      await this.sendMainKeyboard(userTelegramId);
      return;
    }
    await this.sendMessageAndKeyboard(userTelegramId, 'Подтверждаете заказ?', buttons);
    await this.bot.sendMessage(userTelegramId, orders);
  }

  async formatOrders(orders: Order[]): Promise<string> {
    let result = '';
    result += `Место: ${orders[0].orderType}\n`;

    orders.forEach((order) => {
      result += `\nДата: ${order.date}\n`;
      if (order.salad.name) {
        result += `${order.salad.name}: ${order.salad.quantity}\n`;
      }
      if (order.soup.name) {
        result += `${order.soup.name}: ${order.soup.quantity}\n`;
      }
      if (order.hotDish.name) {
        result += `${order.hotDish.name}: ${order.hotDish.quantity}\n`;
      }
      result += `Дополнение: ${order.extra || '-'}\n`;
      result += `Цена: ${order.price}\n\n`;
    });

    const totalCost = orders.reduce((acc, order) => acc + order.price, 0);
    result += `Общая стоимость заказа: ${totalCost}`;
    if (orders[0].orderType === 'Доставка' && totalCost < 4500) {
      return 'Заказ должен быть больше 4500';
    }
    return result;
  }

  async getAllOrders(userTelegramId: number): Promise<string> {
    const orders = await this.orderService.get(userTelegramId);
    return await this.formatOrders(orders);
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
    this.bot.onText(/\/delete_order/, async (msg: any) => {
      const userTelegramId = msg.from.id;
      if (await this.orderService.get(userTelegramId)) {
        await this.orderService.del(userTelegramId);
      }
      await this.userService.saveOrderDone(userTelegramId, false);
      await this.bot.sendMessage(userTelegramId, 'Ваш текущий заказ удалён.\nТеперь вы можете составить новый заказ.');
      await this.sendMainKeyboard(userTelegramId);
      await this.userService.saveState(userTelegramId, 'start');
    });

    this.bot.on('poll_answer', async (msg: TelegramBot.PollAnswer) => {
      const userTelegramId = msg.user.id;
      const pollId = await this.userService.getPollId(userTelegramId);
      if (!pollId) return;
      await this.bot.stopPoll(userTelegramId, pollId);
      await this.userService.updatePollId(userTelegramId);

      const nums = ['0', '1', '2', '3', '4'];
      const state = await this.userService.getState(userTelegramId);
      if (nums.includes(state)) {
        this.saveChoice(userTelegramId, msg);
        return;
      }

      const days: string[] = [];
      msg.option_ids.forEach((day) => {
        days.push(`${day}`);
      });
      await this.userService.saveOrderDays(userTelegramId, days);
      await this.makeAllWeekPolls(userTelegramId, msg.option_ids[0]);
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

      const pollId = await this.userService.getPollId(userTelegramId);
      if (pollId) {
        await this.bot.stopPoll(userTelegramId, pollId);
        await this.userService.updatePollId(userTelegramId);
      }

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
      const nums = ['0', '1', '2', '3', '4'];
      const state: string = await this.userService.getState(userTelegramId);
      if (nums.includes(state)) {
        const orderDays: string[] = await this.userService.getOrderDays(userTelegramId);
        const indexDay = orderDays.indexOf(state);
        if (msg.text == 'Да') {
          await this.bot.sendMessage(userTelegramId, `Напишите дополнение`);
        } else if (msg.text == 'Нет') {
          if (indexDay + 1 < orderDays.length) {
            this.makeAllWeekPolls(userTelegramId, Number(orderDays[indexDay + 1]));
          } else {
            await this.confirmation(userTelegramId);
          }
        } else {
          const nextWeekDates = await this.getNextWeekDates();
          await this.orderService.updateOrder(userTelegramId, nextWeekDates[Number(state)], message);
          if (indexDay + 1 < orderDays.length) {
            this.makeAllWeekPolls(userTelegramId, Number(orderDays[indexDay + 1]));
          } else {
            await this.confirmation(userTelegramId);
          }
        }
        return;
      }
      if (state === 'confirm') {
        if (msg.text == 'Да, конечно') {
          await this.userService.saveOrderDone(userTelegramId, true);
          await this.bot.sendMessage(userTelegramId, 'Ваш заказ потвержден');
          await this.userService.saveState(userTelegramId, 'start');
        } else if (msg.text == 'Нет, начать заново') {
          await this.sendMainKeyboard(userTelegramId);
          await this.userService.saveState(userTelegramId, 'start');
          return;
        }
      }
      const date = new Date();
      const zzz = date.getDay();
      if (zzz === 0) {
        await this.bot.sendMessage(userTelegramId, 'Заказы можно делать пятница, суббота');
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
