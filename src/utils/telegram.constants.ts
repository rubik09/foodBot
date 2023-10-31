export interface MainMessage {
  text1: string;
  text2: string;
  orderType: string;
}

export const mainMessages: MainMessage[] = [
  {text1: 'Офис (Пека дапчевича)', text2: 'В офис обеды привозятся в промежуток с 11-11.30 каждый будний день', orderType: 'Офис'},
  {text1: 'Доставка (минимальный заказ 4500)', text2: 'Доставка проводим по следующим районам: Врачар,Стари Град, Мирьево, Вождовац', orderType: 'Доставка'},
  {text1: 'Елизмо', text2: 'Доставка проводится с 12-13.30', orderType: 'Елизмо'},
  {text1: 'Альфалидс', text2: 'Доставка проводится с 12-13.30', orderType: 'Альфалидс'},
  // {text1: 'Поддержка', text2: 'Контакт для связи @dante_0413', orderType: '' },
];
export const secondStepActions = [
  {
    button: 'Посмотреть меню',
    action: 'menu'
  },
  {
    button: 'Заказать обеды на неделю (ДАТЫ)',
    action: 'poll'
  },
  {
    button: 'Наши цены',
    action: 'price'
  },
] 
export const states = [ mainMessages, secondStepActions]



export const actionsMap = {
  back: {
    templateText: 'Назад',
    actionName: 'back',
  },
  support: {
    templateText: 'Поддержка',
    actionName: 'support',
  },
  begin: {
    templateText: 'В начало',
    actionName: 'begin',
  }
};
