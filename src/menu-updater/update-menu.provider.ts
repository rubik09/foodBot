import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Menu } from '../schemas/menu.schema';

@Injectable()
export class UpdateMenuProvider {
  constructor(@InjectModel(Menu.name) private menuModel: Model<Menu>) {}
  async removeAllMenu() {
    await this.menuModel.deleteMany();
  }

  async uploadMenu(menu: Menu[]) {
    await this.menuModel.insertMany(menu);
  }

  async getMenuPosition(): Promise<Menu[]> {
    return await this.menuModel.find();
  }

  async getMenuPosition1() {
    return await this.menuModel.findOne({ weekDay: 'Понеделик' });
  }
}
