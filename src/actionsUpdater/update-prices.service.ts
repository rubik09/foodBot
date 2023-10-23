import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import languageService from '../language/language.service';
import { httpResponceMessages } from '../utils/messages';
import load from './parser';
import { Menu } from '../schemas/menu.schema';
import { UpdateActionProvider } from './update-prices.provider';
import loadActions from './parser';
import { googleApiService } from 'src/utils/googleApi/api';
// const { langMap, actionsDict } = languageService;

@Injectable()
export class UpdateActionsService implements OnModuleInit {
  private readonly logger = new Logger(UpdateActionsService.name);
  constructor(private updateActionProvider: UpdateActionProvider) {}
  //loads or updates actions from google sheet
  async loadActions() {
    const rr = await googleApiService.getButtons(3);
    // console.log(rr)
    // const res = await load();
    // console.log(res)
    // await this.updateActionProvider.removeAllActions();
    // await this.updateActionProvider.uploadActions(res);
    // return JSON.stringify({ message: httpResponceMessages.success });
  }
  //create map for action.type <-> Action[]
  async onModuleInit() {
    try {
      await googleApiService.init();
      await loadActions(3);
      // const res: Price[] = await this.updateActionProvider.getActions();
      // if (!res.length) {
      //   this.logger.warn('not found buttons in DB, try to load from google sheet');
      
      //   if (!actions.length) throw new Error('No buttons in DB and google sheet');
      //   res.push(...actions);
      // }
      // res.forEach((action) => {
      //   if (!actionsDict.has(action.type)) {
      //     actionsDict.set(action.type, []);
      //   }
      //   const actionTextArr = actionsDict.get(action.type);
      //   actionTextArr[langMap.get(action.language)] = action;
      // });
    } catch {
      throw new Error("Can't load action buttons");
    }
  }
}
