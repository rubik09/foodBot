
import { Message } from 'node-telegram-bot-api';

interface ActionObject {
    [key: string]: {
      button: string;
      action: (msg: Message) => void;
    };
  }

export const mainActions:ActionObject[] = [
    {
      back: {
        button: 'Назад',
        action: function (msg: Message) {
            return this.back(msg);
          }
        }
    },
    {
      support: {
        button: 'Написать в поддержку',
        action: function (msg: Message) {
            return this.support(msg);
          },
        }
    },
    {
      greeting: {
        button: 'Спасибо, что помогли',
        action: function (msg: Message) {
            return this.greeting(msg);
          }
      },
    },
    {
      begin: {
        button: 'В начало',
        action: function (msg: Message) {
            return this.begin(msg);
          }
      },
    },
  ];
  
  export const langMap = {
    Русский: 'ru',
    English: 'en',
  };
  