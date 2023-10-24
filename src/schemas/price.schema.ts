import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PriceDocument = HydratedDocument<Price>;

@Schema({ collection: `prices` })
export class Price {
  @Prop({ required: true })
  soupPrice: number;

  @Prop()
  saladPrice: number;

  @Prop()
  hotDishPrice: number;
}

export const PriceSchema = SchemaFactory.createForClass(Price);