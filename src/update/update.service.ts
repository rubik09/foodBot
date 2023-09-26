import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateService {
  updateBotStructure(lang: string | string[] | null) {
    return JSON.stringify({
      msg: 'This func will run parser and update bot structure after parsing google table: put new data in DB, or return erros in parsing and keep current condition',
      params: lang,
    });
  }
}
