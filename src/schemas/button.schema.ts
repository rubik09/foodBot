import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ButtonDocument = HydratedDocument<Button>;

@Schema({ collection: `geoRu` })
export class Button {
  @Prop({ required: true })
  button: string;

  @Prop()
  text: string;

  @Prop({ required: true })
  path: string;
}

export const ButtonSchema = SchemaFactory.createForClass(Button);
