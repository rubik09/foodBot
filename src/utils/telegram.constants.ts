import { Message } from 'node-telegram-bot-api';

interface ActionObject {
  [key: string]: {
    action: (msg: Message) => void;
  };
}

export class MainActions {
  constructor() {}

  public static back(msg: Message, lang: string): Function {
    return this.back(msg, lang);
  }

  public static support(msg: Message, lang: string): Function {
    return this.support(msg, lang);
  }

  public static greeting(msg: Message, lang: string): Function {
    return this.greeting(msg, lang);
  }

  public static begin(msg: Message, lang: string): Function {
    return this.begin(msg, lang);
  }
}

export const langMap = {
  Русский: 'ru',
  English: 'en',
};

export type ActionType = 'back' | 'support' | 'greeting' | 'begin';
