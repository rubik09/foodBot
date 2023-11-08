import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ collection: `orders` })
class Salad {
  @Prop()
  name: string;

  @Prop()
  quantity: number;
}
class Soup {
  @Prop()
  name: string;

  @Prop()
  quantity: number;
}
class HotDish {
  @Prop()
  name: string;

  @Prop()
  quantity: number;
}
export class Order {
  @Prop({ required: true })
  userTelegramId: number;

  @Prop()
  fullName: string;

  @Prop()
  salad: Salad;

  @Prop()
  soup: Soup;

  @Prop()
  hotDish: HotDish;

  @Prop()
  extra: string;

  @Prop()
  orderType: string;

  @Prop()
  date: string;

  @Prop()
  price: number;
}

export const Orderchema = SchemaFactory.createForClass(Order);
