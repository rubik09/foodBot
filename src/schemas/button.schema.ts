import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ButtonDocument = HydratedDocument<Button>;

@Schema({ collection: `buttons` })
export class Button {
  @Prop({ required: true })
  button: string;

  @Prop()
  text: string;

  @Prop()
  imageLink: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true, index: true })
  language: string;
}

export const ButtonSchema = SchemaFactory.createForClass(Button);
