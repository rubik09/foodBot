import { PriceEntries } from '../telegram.constants';

export async function parsePrices(prices: PriceEntries): Promise<string> {
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
