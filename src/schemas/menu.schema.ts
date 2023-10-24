import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type menuDocument = HydratedDocument<Menu>;

@Schema({ collection: `menu` })
export class Menu {
  @Prop({ required: true })
  weekDay: string;

  @Prop({ required: true })
  soup: string;

  @Prop({ required: true })
  hotDish1: string;

  @Prop()
  hotDish2: string;

  @Prop()
  hotDish3: string;

  @Prop({ required: true })
  salad: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
