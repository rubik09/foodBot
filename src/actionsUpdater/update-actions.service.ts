import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import languageService from '../language/language.service';
import {httpResponceMessages} from '../utils/messages';
import load from './parser';
import { Action } from 'src/schemas/action.schema';
const { langMap, actionsDict } = languageService;
@Injectable()
export class UpdateActionsService implements OnModuleInit {
  private readonly logger = new Logger(UpdateActionsService.name);
  constructor(@InjectModel(Action.name) private actionModel: Model<Action>) {}
  //loads or updates actions from google sheet
  async loadActions() {
    const res = await load();
    await this.actionModel.deleteMany();
    await this.actionModel.insertMany(res);
    return JSON.stringify({ message: httpResponceMessages.success });
  }
  //create map for action.type <-> Action[]
  async onModuleInit() {
    try {
      const res: Action[] = await this.actionModel.find();
      if (!res.length) {
        this.logger.warn('not found buttons in DB, try to load from google sheet');
        await this.loadActions();
        const actions = await this.actionModel.find();
        if (!actions.length) throw new Error('No buttons in DB and google sheet');
        res.push(...actions);
      }
      res.forEach((action) => {
        if (!actionsDict.has(action.type)) {
          actionsDict.set(action.type, []);
        }
        const actionTextArr = actionsDict.get(action.type);
        actionTextArr[langMap.get(action.language)] = action;
      });
    } catch {
      throw new Error("Can't load action buttons");
    }
  }
}
