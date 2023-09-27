import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(userId: number, username: string, language: string, state: string = ''): Promise<User> {
    const createdUser = new this.userModel({ userId, username ,language, state });
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

  async getState(userId: number): Promise<string> {
    return (await this.userModel.findOne({ userId })).state;
  }    
}