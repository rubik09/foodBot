import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema';

@Injectable()
export class UserProvider {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser(
    userTelegramId: number,
    username: string,
    state: string = 'start',
  ): Promise<User> {
    return await this.userModel.create({ userTelegramId, username, state });
  }

  async getUser(userTelegramId: number): Promise<User | null> {
    return await this.userModel.findOne({ userTelegramId });
  }

  async saveState(userTelegramId: number, state: string): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, state });
    } else {
      user.state = state;
    }
    return await user.save();
  }

  async saveOrderType(userTelegramId: number, orderType: string): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, orderType });
    } else {
      user.orderType = orderType;
    }
    return await user.save();
  }
  async getState(userTelegramId: number): Promise<string> {
    return (await this.userModel.findOne({ userTelegramId })).state;
  }
  // async saveLanguage(userTelegramId: number, language: string, state: string = ''): Promise<User> {
  //   let user = await this.userModel.findOne({ userTelegramId });
  //   if (!user) {
  //     user = new this.userModel({ userTelegramId, language, state });
  //   } else {
  //     user.language = language;
  //     user.state = state;
  //   }
  //   return await user.save();
  // }
}
