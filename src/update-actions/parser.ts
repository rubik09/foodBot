import getDataFromApi from 'src/utils/googleApi/api';
import Action from 'src/types/action';
import { langArr } from 'src/lang';

const arrToActions = (arr: string[][]): Action[] => {
  const res: Action[] = [];
  arr.forEach((row) => {
    const type = row[0].trim();
    let langIdx = 0;
    for (let i = 2; i < row.length; i += 2) {
      const newAction = {
        button: row[i].trim(),
        text: row[i + 1]?.trim() || '',
        type,
        language: langArr[langIdx][0],
      };
      langIdx++;
      if (!newAction.button) continue;
      res.push(newAction);
    }
  });
  return res;
};

export default async function loadActions() {
  try {
    const res = await getDataFromApi(0);
    return arrToActions(res);
  } catch (err) {
    throw new Error(err);
  }
}
