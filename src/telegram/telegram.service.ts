import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from './user/user.service';
import { OrderService } from './order/order.service';
import { Message } from 'node-telegram-bot-api';
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';
import { MainMessage, mainMessages } from '../utils/telegram.constants';
import { UpdateMenuService } from '../menu-updater/update-menu.service';
import { UpdatePriceService } from '../price-updater/update-price.service';
import {
  mainActionsButtons,
  weekDaysNumbers,
  offficesKeyboard,
  PriceEntries,
  secondStep,
  Steps,
  weekDays,
} from './telegram.constants';
import { addButtonsToKeyboard } from './utils/addButtonsToKeyboard';
import { botMainMessage } from 'src/utils/messages';
import { Cron } from '@nestjs/schedule';
import { createDailyMenuPoll, formatOrders, parseOrder } from './utils/ordersParsing';
import { formatMenu, printMenuForDay } from './utils/menuParsing';
import { getNextWeekDates } from './utils/getWeekDays';
import { parsePrices } from './utils/priceParsing';
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

  @Cron('0 10 * * 1-5', { timeZone: 'UTC' })
  async sendNotifications() {
    this.logger.log('Начинается рассылка по заказам');
    const today = new Date();
    let counter = 0;
    try {
      const ordersToday = await this.orderService.getByDate(today.toISOString().split('T')[0]);

      for (const order of ordersToday) {
        const orderDone = await this.userService.getOrderDone(order.userTelegramId);
        if (orderDone) {
          const parsedOrder = await parseOrder(order);
          const message = `Ваш заказ на сегодня:\n${parsedOrder}`;
          await this.bot.sendMessage(order.userTelegramId, message);
          counter += 1;
        }
      }
    } catch (error) {
      this.logger.error('Ошибка при поиске заказов:', error);
    }

    this.logger.log(`Рассылка отправлена. Количество: ${counter}`);
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

  async sendMainKeyboard(userTelegramId: number) {
    const markup: TelegramBot.ReplyKeyboardMarkup = {
      keyboard: offficesKeyboard,
      one_time_keyboard: true,
      resize_keyboard: true,
    };
    await this.userService.saveState(userTelegramId, 'start');
    this.bot.sendMessage(userTelegramId, botMainMessage.firstMessage, {
      reply_markup: markup,
    });
  }

  async showMenu() {
    const menuItems = await this.updateMenuService.getMenu();
    const formattedMenu = await formatMenu(menuItems);
    const newMenu = await printMenuForDay(formattedMenu);
    return newMenu;
  }

  async sendDailyMenuPoll(chatId: number, order: any) {
    const options = await createDailyMenuPoll(order);
    const mmm = await this.bot.sendPoll(chatId, order.weekDay, options, {
      allows_multiple_answers: true,
      is_anonymous: false,
    });

    this.userService.savePollId(chatId, mmm.message_id);
  }

  async showPrices(): Promise<string> {
    const prices: PriceEntries = await this.updatePricesService.getPricesEntries();
    return parsePrices(prices);
  }

  async processOrderResponse(response: string[], menu: any, orderModel: any) {
    const order = { ...orderModel };
    const prices: PriceEntries = await this.updatePricesService.getPricesEntries();
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

    const nextWeekDates = await getNextWeekDates();
    const orders = await this.updateMenuService.getMenu();
    const state = await this.userService.getState(msg.user.id);
    const options = await createDailyMenuPoll(orders[Number(state)]);
    const food: string[] = [];
    choice.forEach((day) => {
      food.push(options[day]);
    });
    const buttons = await addButtonsToKeyboard(['Да', 'Нет'], 2);
    await this.sendMessageAndKeyboard(chatId, 'Дополнения?', buttons);

    const orderModel: Order = {
      userTelegramId: msg.user.id,
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
    const orders = await this.updateMenuService.getMenu();
    await this.userService.saveState(chatId, `${day}`);
    await this.sendDailyMenuPoll(chatId, orders[day]);
  }

  async startOrder(msg: Message) {
    const userTelegramId = msg.from.id;
    const orderDone = await this.userService.getOrderDone(userTelegramId);
    if (orderDone) {
      const buttons = await addButtonsToKeyboard(['В начало'], 1);
      await this.sendMessageAndKeyboard(
        userTelegramId,
        'Ваш заказ сформирован, если вы хотите сбросить текущий заказ, то воспользуйтесь командой \n/delete_order либо нажмите кнопку В начало',
        buttons,
      );
      return 'done';
    }
    if (await this.orderService.get(msg.chat.id)) {
      const nextWeekDates = await getNextWeekDates();
      await this.orderService.del(userTelegramId, nextWeekDates);
    }
    const mmm = await this.bot.sendPoll(userTelegramId, 'Выбери день', weekDays, {
      allows_multiple_answers: true,
      is_anonymous: false,
    });
    this.userService.savePollId(msg.from.id, mmm.message_id);
    return;
  }

  async myOrder(msg: Message) {
    const userTelegramId = msg.from.id;
    const isOrder = await this.userService.getOrderDone(userTelegramId);
    if (isOrder) {
      const orders = await this.getAllOrders(userTelegramId);
      if (orders) {
        await this.bot.sendMessage(userTelegramId, `Ваш текущий заказ:\n${orders}`);
      } else {
        await this.bot.sendMessage(userTelegramId, `У вас еще нет текущего заказа`);
      }
    } else {
      await this.bot.sendMessage(userTelegramId, `У вас еще нет подтвержденного заказа`);
    }
    await this.sendMainKeyboard(userTelegramId);

    return 'Возвращаемся в главное меню';
  }

  async findMessageIndex(arr: MainMessage[], message: string) {
    return arr.findIndex((item) => item.text1 === message);
  }

  async confirmation(userTelegramId: number) {
    await this.userService.saveState(userTelegramId, 'confirm');
    const buttons = await addButtonsToKeyboard(['Да, конечно', 'Нет, начать заново'], 1);
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

  async getAllOrders(userTelegramId: number): Promise<string> {
    const nextWeekDates = await getNextWeekDates();
    const orders = await this.orderService.getNextWeek(userTelegramId, nextWeekDates);
    if (!orders[0]) return '';
    return await formatOrders(orders);
  }

  async handleUpdates(): Promise<void> {
    this.bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
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

    this.bot.onText(/\/reset/, async (msg: Message) => {
      const userTelegramId = msg.from.id;
      const managerId: string = await this.configService.get('app-config.MANAGER_ID');
      if (userTelegramId !== Number(managerId)) return;
      const result = await this.userService.changeAllStatusOrderDone();
      if (result) {
        await this.bot.sendMessage(userTelegramId, 'Все статусы сброшены');
      }
    });

    this.bot.onText(/\/delete_order/, async (msg: TelegramBot.Message) => {
      const userTelegramId = msg.from.id;
      const date = new Date();
      const todayDay = date.getDay();
      if (todayDay !== 5 && todayDay !== 6) {
        await this.bot.sendMessage(userTelegramId, 'Заказы можно удалять пятница, суббота');
        await this.sendMainKeyboard(userTelegramId);
        return;
      }
      const orders = await this.getAllOrders(userTelegramId);
      if (!orders) {
        await this.sendMainKeyboard(userTelegramId);
        return await this.bot.sendMessage(userTelegramId, 'У вас нет текущего заказа');
      }
      await this.bot.sendMessage(userTelegramId, `Ваш текущий заказ:\n${orders}`);
      const buttons = await addButtonsToKeyboard(['Да, уверен', 'Нет, кажется, это ошибка'], 1);

      await this.sendMessageAndKeyboard(
        userTelegramId,
        'Ваш текущий заказ будет удалён.\nВы уверены, что хотите это сделать?',
        buttons,
      );
      await this.userService.saveState(userTelegramId, 'deleteOrder');
      return;
    });

    this.bot.on('poll_answer', async (msg: TelegramBot.PollAnswer) => {
      const userTelegramId = msg.user.id;
      const pollId = await this.userService.getPollId(userTelegramId);
      if (!pollId) return;
      await this.bot.stopPoll(userTelegramId, pollId);
      await this.userService.updatePollId(userTelegramId);

      const state = await this.userService.getState(userTelegramId);
      if (weekDaysNumbers.includes(state)) {
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
      type SecondStepButtons = {
        [key in Steps]: (msg: Message) => Promise<string>;
      };

      const secondStepButtons: SecondStepButtons = {
        [Steps.menu]: this.showMenu.bind(this),
        [Steps.prices]: this.showPrices.bind(this),
        [Steps.order]: this.startOrder.bind(this),
        [Steps.myOrder]: this.myOrder.bind(this),
      };

      const message = msg?.text?.toString();
      const userTelegramId = msg.from.id;
      const userData = await this.userService.getUser(userTelegramId);
      if (!userData) return;
      const pollId = await this.userService.getPollId(userTelegramId);
      if (pollId > 0) {
        await this.bot.stopPoll(userTelegramId, pollId);
        await this.userService.updatePollId(userTelegramId);

        await this.sendMainKeyboard(userTelegramId);
        await this.userService.saveState(userTelegramId, 'start');
      }
      const state: string = await this.userService.getState(userTelegramId);

      if (weekDaysNumbers.includes(state)) {
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
          const nextWeekDates = await getNextWeekDates();
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
          await this.bot.sendMessage(
            userTelegramId,
            'А теперь последний шаг\nВведите ваше имя и фамилию (пример: Иван Иванов)',
          );
          await this.userService.saveState(userTelegramId, 'fullName');
          return;
        } else if (msg.text == 'Нет, начать заново') {
          await this.sendMainKeyboard(userTelegramId);
          return;
        }
      }
      if (state === 'fullName') {
        await this.userService.saveFullName(userTelegramId, msg.text);
        await this.bot.sendMessage(userTelegramId, 'Спасибо,\nВаш заказ создан и отправлен!');
        await this.sendMainKeyboard(userTelegramId);
      }
      if (state === 'deleteOrder') {
        if (msg.text == 'Да, уверен') {
          await this.userService.saveOrderDone(userTelegramId, true);
          const nextWeekDates = await getNextWeekDates();
          if (await this.orderService.getNextWeek(userTelegramId, nextWeekDates)) {
            await this.orderService.del(userTelegramId, nextWeekDates);
            await this.sendMainKeyboard(userTelegramId);
            await this.userService.saveOrderDone(userTelegramId, false);
            await this.bot.sendMessage(
              userTelegramId,
              'Ваш текущий заказ удалён.\nТеперь вы можете составить новый заказ.',
            );

            await this.sendMainKeyboard(userTelegramId);
          }
        } else {
          await this.sendMainKeyboard(userTelegramId);
        }
        return;
      }
      const date = new Date();
      const todayDay = date.getDay();
      if (todayDay !== 5 && todayDay !== 6) {
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
          const buttons = await addButtonsToKeyboard(
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
        this.logger.log(findMessage, userTelegramId);
        if (findMessage < 0) {
          await this.sendMainKeyboard(userTelegramId);
          return;
        }
        const buttons = await addButtonsToKeyboard(
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
        const buttons = await addButtonsToKeyboard(mainActionsButtons, 2);
        const foundState = Object.values(secondStep).find((item) => item.text === message)?.state;
        if (foundState === 'myOrder') return;
        await this.userService.saveState(userTelegramId, foundState);
        if (foundState === 'order') return;
        await this.sendMessageAndKeyboard(userTelegramId, messageSecondStep, buttons);
      }
    });
  }
  async onModuleInit() {
    await this.handleUpdates();
    this.logger.log('Bot started successfully');
  }
}
