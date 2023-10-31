import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserProvider } from './user.provider';

@Injectable()
export class UserService {
  constructor(private userProvider: UserProvider) { }

  async createUser(
    userTelegramId: number,
    username: string,
    state: string = 'start'
  ): Promise<User> {
    return this.userProvider.createUser(userTelegramId, username, state);
  }

  async getUser(userTelegramId: number): Promise<User | null> {
    return this.userProvider.getUser(userTelegramId);
  }

  async saveState(userTelegramId: number, state: string): Promise<User> {
    return this.userProvider.saveState(userTelegramId, state);
  }
  async saveOrderType(userTelegramId: number, orderType: string): Promise<User> {
    return this.userProvider.saveOrderType(userTelegramId, orderType);
  }
  async savePollId(userTelegramId: number, pollId: number): Promise<User> {
    return this.userProvider.savePollId(userTelegramId, pollId);
  }
  async saveOrderDays(userTelegramId: number, orderDays: string[]): Promise<User> {
    return this.userProvider.saveOrderDays(userTelegramId, orderDays);
  }
  async saveOrderDone(userTelegramId: number, orderDone: boolean): Promise<User> {
    return this.userProvider.saveOrderDone(userTelegramId, orderDone);
  }
  async updatePollId(userTelegramId: number): Promise<User> {
    return this.userProvider.updatePollId(userTelegramId);
  }

  async getState(userTelegramId: number): Promise<string> {
    return this.userProvider.getState(userTelegramId);
  }
  async getOrderType(userTelegramId: number): Promise<string> {
    return this.userProvider.getOrderType(userTelegramId);
  }
  async getPollId(userTelegramId: number): Promise<number> {
    return (await this.userProvider.getPollId(userTelegramId));
  }

  // async saveLanguage(userTelegramId: number, language: string, state: string = ''): Promise<User> {
  //   return this.userProvider.saveLanguage(userTelegramId, language, state);
  // }
}
