import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(userTelegramId: number, username: string, state: string = 'lang', language: string = null): Promise<User> {
    return await this.userModel.create({ userTelegramId, username, state, language });
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

  async saveLanguage(userTelegramId: number, language: string, state: string = ''): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, language, state });
    } else {
      user.language = language;
      user.state = state;
    }
    return await user.save();
  }

  async getState(userTelegramId: number): Promise<string> {
    return (await this.userModel.findOne({ userTelegramId })).state;
  }
}
