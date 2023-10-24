import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import languageService from '../language/language.service';
import { httpResponceMessages } from '../utils/messages';
import load from './parser';
import { Menu } from '../schemas/menu.schema';
import { UpdateMenuProvider } from './update-menu.provider';
import loadActions from './parser';
import { googleApiService } from 'src/utils/googleApi/api';
// const { langMap, actionsDict } = languageService;

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
  async getMenu () {
    const result = await this.updateMenuProvider.getMenuPosition();
    return result;
  }
  //create map for action.type <-> Action[]
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
