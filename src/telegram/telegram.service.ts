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
  
  async sendMessageAndKeyboard(chatId: number, text: string, buttons: { text: string }[][]) {
    this.bot.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async returnMainMenu(chatId: number, text: string = 'Главное меню⬇️') {
    const buttons = await this.buttonService.findButtonsByPath2('');
    this.bot.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: buttons,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }

  async begin(msg: any){
    await this.userService.saveState(msg.from.id,'');
    await this.returnMainMenu(msg.from.id);
  };

  async back(msg: any){
    const userId = msg.from.id;
    const state = await this.userService.getState(userId);
    let path = await this.buttonService.correctPath(state);
    await this.userService.saveState(userId, path);
    const buttons = await this.buttonService.findButtonsByPath2(path);
    
     const buttonPrev = await this.buttonService.getButton(path)
    
    this.sendMessageAndKeyboard(userId.toString(), (buttonPrev?.button||'Главное меню⬇️'), buttons);
  };

  async handleUpdates(): Promise<void> {
    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      const userTelegram = msg.from;
      const user = await this.userService.getUser(userTelegram.id);
      if (user) {

        const state = await this.userService.getState(userTelegram.id);
        const buttons = await this.buttonService.findButtonsByPath2(state);
        this.sendMessageAndKeyboard(chatId, 'Привет', buttons)
      } else {
        this.bot.sendMessage(chatId, 'Выберите язык:', {
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
    });

    this.bot.onText(/^(Русский|English)$/, async (msg, match) => {
      const langMap = {
        'Русский': 'geoRu',
        'English': 'geoGB'
      }
      const chatId = msg.chat.id;
      const user = msg.from;
      const langCode = langMap[match[1] as keyof typeof langMap]
      const username = user.username || '';

      await this.userService.createUser(user.id, username, langCode);

      this.bot.sendMessage(chatId, `${match[1]} ✅`);
      this.returnMainMenu(chatId)
    });

    this.bot.on('message', async (msg: any) => {
      const mainActions = [
        {
          'back': {
            button: "Назад",
            action: (msg: any) => this.back(msg)
          },
        },
        {
          'support': {
            button : "Написать в поддержку",
            action: "support",
          },
        },
        {
          'greeting': {
            button : "Спасибо что помогли",
            action: "greeting",
          },
        },
        {
          'begin': {
            button : "В начало",
            action: (msg: any) => this.begin(msg)
          },
        }
      ];
      const message = msg.text.toString()
      const user = msg.from;
      const foundAction = mainActions.find(action => Object.values(action)[0]?.button === message);
      if (foundAction){
        //@ts-ignore
        await foundAction[(Object.keys(foundAction))].action(msg)
        return
      }

      // const userId = msg.from.id;
      // const state = await this.userService.getState(userId);
      // const buttons2 = await this.buttonService.findButtonsByPath2(state);
      // console.log(buttons2, state)
      // const textExists = buttons2.some((row) => {
      //   return row.some(async (button) => {
      //     console.log(button.text, message, button.text === message)
      //     if(button.text === message){
      //       let button3 = await this.buttonService.getButtonByName(message);
      //       await this.userService.saveState(user.id, button3.path);
      //       const buttons = await this.buttonService.findButtonsByPath2(button3.path);
      //       await this.sendMessageAndKeyboard(msg.from.id, button.text, buttons);
      //     } else {
      //       await this.returnMainMenu(msg.chat.id)
      //     }
      //   });
      // });
      // console.log(textExists)

      let button = await this.buttonService.getButtonByName(message); // проверка в монге есть ли кнока с текстом
      if (button) {
        const {text, path} = button
        await this.userService.saveState(user.id, path);
        const buttons = await this.buttonService.findButtonsByPath2(path);
        this.sendMessageAndKeyboard(msg.from.id, text, buttons);
      
    }
    });
  }
}
