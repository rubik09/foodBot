import { googleApiService } from '../utils/googleApi/api';
import Menu from '../types/menu';
// import languageService from '../language/language.service';

const arrToActions = (arr: string[][], headerArr: string[]): Menu[] => {
  const res: Menu[] = [];
  const arrA: string[][] = []
  arr.forEach((row) => {
    arrA.push(row)
  });
  for (let i = 1; i < headerArr.length; i++) {
    const menuForDay = getMenuForDay(i, arrA, headerArr[i]);
    res.push(menuForDay);
  }
  return res;
};
function getMenuForDay(dayIndex: number, menuData: string[][], weekDay: string): Menu {
  return {
    weekDay: weekDay,
    soup: menuData[0][dayIndex] !== undefined ? menuData[0][dayIndex] : '',
    hotDish1: menuData[1][dayIndex] !== undefined ? menuData[1][dayIndex] : '',
    hotDish2: menuData[2][dayIndex] !== undefined ? menuData[2][dayIndex] : '',
    hotDish3: menuData[3][dayIndex] !== undefined ? menuData[3][dayIndex] : '',
    salad: menuData[4][dayIndex] !== undefined ? menuData[4][dayIndex] : '',
  };
}

export default async function loadActions(pageNumber: number) {
  try {
    const actionArr = await googleApiService.getButtons(pageNumber);
    const headerArr = await googleApiService.getPageHeaders(pageNumber);
    return arrToActions(actionArr, headerArr);
  } catch (err) {
    throw new Error(err);
  }
}
