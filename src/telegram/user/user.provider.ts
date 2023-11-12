import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema';

@Injectable()
export class UserProvider {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser(userTelegramId: number, username: string, state = 'start'): Promise<User> {
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

  async savePollId(userTelegramId: number, pollId: number): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, pollId });
    } else {
      user.pollId = pollId;
    }
    return await user.save();
  }

  async updatePollId(userTelegramId: number): Promise<User> {
    const filter = { userTelegramId };
    const update = { pollId: 0 };
    return await this.userModel.findOneAndUpdate(filter, update);
  }

  async saveOrderDays(userTelegramId: number, orderDays: string[]): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, orderDays });
    } else {
      user.orderDays = orderDays;
    }
    return await user.save();
  }

  async saveFullName(userTelegramId: number, fullName: string): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, fullName });
    } else {
      user.fullName = fullName;
    }
    return await user.save();
  }
  async getOrderDays(userTelegramId: number): Promise<string[]> {
    return (await this.userModel.findOne({ userTelegramId })).orderDays;
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

  async saveOrderDone(userTelegramId: number, orderDone: boolean): Promise<User> {
    let user = await this.userModel.findOne({ userTelegramId });
    if (!user) {
      user = new this.userModel({ userTelegramId, orderDone });
    } else {
      user.orderDone = orderDone;
    }
    return await user.save();
  }

  async getOrderType(userTelegramId: number): Promise<string> {
    return (await this.userModel.findOne({ userTelegramId })).orderType;
  }
  async getFullNameById(userTelegramId: number): Promise<string> {
    return (await this.userModel.findOne({ userTelegramId })).fullName;
  }
  async getState(userTelegramId: number): Promise<string> {
    return (await this.userModel.findOne({ userTelegramId })).state;
  }
  async getOrderDone(userTelegramId: number): Promise<boolean> {
    return (await this.userModel.findOne({ userTelegramId })).orderDone;
  }
  async changeAllStatusOrderDone(): Promise<boolean> {
    try {
      const result = await this.userModel.updateMany({}, { $set: { orderDone: false } });
      return !!result.modifiedCount;
    } catch (error) {
      console.error('Error updating orderDone status for all:', error);
      return false;
    }
  }

  async getPollId(userTelegramId: number): Promise<number> {
    return (await this.userModel.findOne({ userTelegramId })).pollId;
  }
}
