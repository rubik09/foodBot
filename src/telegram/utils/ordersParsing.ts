import { Order } from '../../schemas/order.schema';

export async function createDailyMenuPoll(order: any) {
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

export async function parseOrder(order: Order, enableePrice = true) {
  let result = '';
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
  if (enableePrice) {
    result += `Цена: ${order.price}\n\n`;
  }
  return result;
}

export async function formatOrders(orders: Order[]): Promise<string> {
  if (!orders) return null;
  let result = '';
  result += `Место: ${orders[0].orderType}\n`;

  for (const order of orders) {
    result += await parseOrder(order);
  }

  const totalCost = orders.reduce((acc, order) => acc + order.price, 0);
  result += `Общая стоимость заказа: ${totalCost}`;
  if (orders[0].orderType === 'Доставка' && totalCost < 4500) {
    return 'Заказ должен быть больше 4500';
  }
  return result;
}
