export const weekDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
export const mainActionsButtons = ['Назад', 'В начало'];

export type PriceEntries = {
  [key: string]: number;
};

export const enum Steps {
  menu = 'Посмотреть меню',
  prices = 'Наши цены',
  order = 'Cделать заказ',
  myOrder = 'Мой заказ',
}

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
  myOrder: {
    text: string;
    state: string;
  };
};

export const secondStep: SecondStep = {
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
  myOrder: {
    text: 'Мой заказ',
    state: 'myOrder',
  },
};

export const offficesKeyboard = [
  [{ text: 'Офис (Пека дапчевича)' }],
  [{ text: 'Доставка (минимальный заказ 4500)' }],
  [{ text: 'Елизмо' }],
  [{ text: 'Альфалидс' }],
];

export const weekDaysNumbers = ['0', '1', '2', '3', '4'];
