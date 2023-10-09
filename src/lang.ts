import Action from './types/action';

class Language {
  langArr: [string, number][] = [
    ['ru', 1],
    ['en', 2],
    ['br', 3],
    ['az', 4],
    ['tr', 5],
    ['fr', 6],
    ['sp', 7],
    ['uz', 8],
  ];
  langMap: Map<string, number>;
  actionsDict: Map<string, Action[]>;
  constructor() {
    this.langMap = new Map(this.langArr);
    this.actionsDict = new Map([]);
  }
  getActionsByLang(lang: string): Action[] {
    
    const res: Action[] = [];
    this.actionsDict.forEach((arr) => {
      res.push(arr.find((el) => el?.language === lang));
    });
    return res;
  }
  getActionByLangAndType(lang: string, type: string): Action {
    return this.actionsDict.get(type).find((el) => el?.language === lang);
  }
}

export default new Language();
