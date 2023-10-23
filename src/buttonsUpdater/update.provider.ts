// import { Model } from 'mongoose';
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Order } from '../schemas/order.schema';

// @Injectable()
// export class UpdateProvider {
//   constructor(@InjectModel(Button.name) private buttonModel: Model<Button>) {}
//   async removeBtnsByLang(lang: string) {
//     await this.buttonModel.deleteMany({ language: lang });
//   }
//   async uploadBtns(btns: Button[]) {
//     await this.buttonModel.insertMany(btns);
//   }
// }
