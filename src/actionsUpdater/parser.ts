import { googleApiService } from '../utils/googleApi/api';
import Menu from '../types/menu';
// import languageService from '../language/language.service';

const arrToActions = (arr: string[][], headerArr: string[]): Menu[] => {
  const res: Menu[] = [];
  const arrA: string[][] = []
  arr.forEach((row) => {
    arrA.push(row)
  });
  for (let i = 1; i < 6; i++) {
    const menuForDay = getMenuForDay(i, arrA);
    res.push(menuForDay);
  }
  console.log(res)
  return res;
};
function getMenuForDay(dayIndex: number, menuData: string[][]): Menu {
  return {
    weekDay: getWeekDay(dayIndex),
    soup: menuData[0][dayIndex],
    hotDish1: menuData[1][dayIndex],
    hotDish2: menuData[2][dayIndex],
    hotDish3: menuData[3][dayIndex],
    salad: menuData[4][dayIndex],
  } ;
}

function getWeekDay(dayIndex: number): string {
  const daysOfWeek = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  return daysOfWeek[dayIndex];
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
