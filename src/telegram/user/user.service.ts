import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(userId: number, username: string, state: string = 'lang', language: string = null): Promise<User> {
    const createdUser = new this.userModel({ userId, username, state, language });
    return await createdUser.save();
  }

  async getUser(userId: number): Promise<User | null> {
    return await this.userModel.findOne({ userId });
  }

  async saveState(userId: number, state: string): Promise<User> {
    let user = await this.userModel.findOne({ userId });
    if (!user) {
      user = new this.userModel({ userId, state });
    } else {
      user.state = state;
    }
    return await user.save();
  }

  async saveLanguage(userId: number, language: string, state: string = ''): Promise<User> {
    let user = await this.userModel.findOne({ userId });
    if (!user) {
      user = new this.userModel({ userId, language, state });
    } else {
      user.language = language;
      user.state = state;
    }
    return await user.save();
  }

  async getState(userId: number): Promise<string> {
    return (await this.userModel.findOne({ userId })).state;
  }
}
