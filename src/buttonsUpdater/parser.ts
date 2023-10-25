import { googleApiService } from '../utils/googleApi/api';
import Price from '../types/price';

const arrToActions = (arr: string[][]): Price[] => {
  const res: Price[] = [];
  const menuForDay = getPrices(arr);
  res.push(menuForDay);
  return res;
};
function getPrices(menuData: string[][]): Price {
  return {
    soupPrice: Number(menuData[0][1]!== undefined ? menuData[0][1] : ''),
    saladPrice: Number(menuData[1][1] !== undefined ? menuData[1][1] : ''),
    hotDishPrice: Number(menuData[2][1] !== undefined ? menuData[2][1] : ''),
  };
}

export default async function loadActions(pageNumber: number) {
  try {
    const actionArr = await googleApiService.getButtons(pageNumber);
    return arrToActions(actionArr);
  } catch (err) {
    throw new Error(err);
  }
}
