import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { httpResponceMessages } from '../utils/messages';
import load from './parser';
import { UpdateMenuProvider } from './update-menu.provider';
import { googleApiService } from 'src/utils/googleApi/api';
import { Menu } from '../schemas/menu.schema';

@Injectable()
export class UpdateMenuService implements OnModuleInit {
  private readonly logger = new Logger(UpdateMenuService.name);
  constructor(private updateMenuProvider: UpdateMenuProvider) {}
  //loads or updates actions from google sheet
  async loadActions() {
    await googleApiService.init();
    const res = await load(3);
    await this.updateMenuProvider.removeAllMenu();
    await this.updateMenuProvider.uploadMenu(res);
    return JSON.stringify({ message: httpResponceMessages.success });
  }

  async getMenu(): Promise<Menu[]> {
    return await this.updateMenuProvider.getMenuPosition();
  }

  async onModuleInit() {
    try {
      await googleApiService.init();
      const res = await load(3);
      await this.updateMenuProvider.removeAllMenu();
      await this.updateMenuProvider.uploadMenu(res);
    } catch {
      throw new Error("Can't load action buttons");
    }
  }
}
