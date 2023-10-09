import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type actionDocument = HydratedDocument<Action>;

@Schema({ collection: `actions` })
export class Action {
  @Prop({ required: true })
  button: string;

  @Prop()
  text: string;

  @Prop({ required: true, index: true })
  language: string;

  @Prop({ required: true })
  type: string;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
