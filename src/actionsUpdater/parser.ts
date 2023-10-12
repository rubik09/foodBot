import { googleApiService } from '../utils/googleApi/api';
import Action from '../types/action';
import languageService from '../language/language.service';

const arrToActions = (arr: string[][], header: string[]): Action[] => {
  const res: Action[] = [];
  arr.forEach((row) => {
    const type = row[0].trim();
    let langIdx = 0;
    for (let i = 2; i < row.length; i += 2) {
      const language = (header[i] || header[i + 1]).toLowerCase();
      const newAction = {
        button: row[i].trim(),
        text: row[i + 1]?.trim() || '',
        type,
        language,
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
    const actionArr = await googleApiService.getButtons(0);
    const headerArr = await googleApiService.getPageHeaders(languageService.langMap.get('actions'));
    return arrToActions(actionArr, headerArr);
  } catch (err) {
    throw new Error(err);
  }
}
