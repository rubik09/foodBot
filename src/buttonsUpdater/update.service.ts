// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import loadBtns from './parser';
// import languageService from '../language/language.service';
// import errors from '../utils/googleApi/errors';
// import { Button } from '../schemas/order.schema';
// import { googleApiService } from '../utils/googleApi/api';
// import { httpResponceMessages } from '../utils/messages';
// import { UpdateProvider } from './update.provider';

// const langMap = languageService.langMap;
// @Injectable()
// export class UpdateService implements OnModuleInit {
//   private readonly logger = new Logger(UpdateService.name);

//   constructor(private updateProvider: UpdateProvider) {}

//   async updateBotStructure(langData: string) {
//     const langs = langData.split(',');
//     langs.forEach((lang) => {
//       if (!langMap.has(lang)) throw new Error(JSON.stringify(errors.wrongLang.text));
//     });
//     for (let lang of langs) {
//       const res:Button[] = await loadBtns(langMap.get(lang));
//       res.forEach((el) => (el.language = lang));
//       await this.updateProvider.removeBtnsByLang(lang);
//       await this.updateProvider.uploadBtns(res);
//       this.logger.log(`Language ${lang} loaded`);
//     }
//     return JSON.stringify({ messages: httpResponceMessages.success });
//   }

//   async onModuleInit() {
//     await googleApiService.init();
//     const langs = (await googleApiService.getPageNames()).map((el) => el.toLowerCase().slice(1, -1));
//     langs.forEach((lang, idx) => languageService.langMap.set(lang, idx));
//   }
//   async findAll(): Promise<any> {
//     const res = await googleApiService.getPageHeaders(0);
//     return res;
//   }
// }
