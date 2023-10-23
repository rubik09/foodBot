import { googleApiService } from '../utils/googleApi/api';
import Menu from '../types/menu';
// import languageService from '../language/language.service';

const arrToActions = (arr: string[][], headerArr: string[]): Menu[] => {
  const res: Menu[] = [];
  arr.forEach((row) => {
    console.log(row)

    for(let i = 1; i < row.length; i += 1) {

    }
    // let langIdx = 0;
    // for (let i = 2; i < row.length; i += 2) {
    //   const newAction = {
    //     price: Number(row[i].trim()),
    //     dish: row[i + 1]?.trim() || '',
    //   };
    //   langIdx++;
    //   if (!newAction.price) continue;
    //   res.push(newAction);
    // }
  });
  return res;
};

export default async function loadActions(pageNumber: number) {
  try {
    const actionArr = await googleApiService.getButtons(pageNumber);
    const headerArr = await googleApiService.getPageHeaders(pageNumber);
    return arrToActions(actionArr, headerArr);
  } catch (err) {
    throw new Error(err);
  }
}
