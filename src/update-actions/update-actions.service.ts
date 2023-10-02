import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import load from './parser';
import { Action } from 'src/schemas/action.schema';
@Injectable()
export class UpdateActionsService {
  constructor(@InjectModel(Action.name) private actionModel: Model<Action>) {}
  async loadActions() {
    const res = await load();
    await this.actionModel.deleteMany();
    await this.actionModel.insertMany(res);
    return JSON.stringify({ msg: 'success update' });
  }
}
