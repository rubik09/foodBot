import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from '../schemas/action.schema';

@Injectable()
export class UpdateActionProvider {
  constructor(@InjectModel(Action.name) private actionModel: Model<Action>) {}
  async removeAllActions() {
    await this.actionModel.deleteMany();
  }
  async uploadActions(actions: Action[]) {
    await this.actionModel.insertMany(actions);
  }
  async getActions() {
    return await this.actionModel.find();
  }
}
