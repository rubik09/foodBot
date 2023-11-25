import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

class Dish {
  name: string;
  quantity: number;
}
@Schema({ collection: `orders` })
export class Order {
  @Prop({ required: true })
  userTelegramId: number;

  @Prop()
  salad: Dish;

  @Prop()
  soup: Dish;

  @Prop()
  hotDish: Dish;

  @Prop()
  extra: string;

  @Prop({ required: true })
  orderType: string;

  @Prop({ required: true })
  date: string;

  @Prop()
  price: number;
}

export const Orderchema = SchemaFactory.createForClass(Order);
