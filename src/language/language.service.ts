import Action from '../types/action';
import greetingMessage from './greetingMessage';
class Language {
  langMap: Map<string, number>;
  actionsDict: Map<string, Action[]>;
  greetingMap: Map<string, string>;
  constructor(greetingMap: Map<string, string>) {
    this.greetingMap = greetingMap;
    this.langMap = new Map();
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

export default new Language(greetingMessage);
