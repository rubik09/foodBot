import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: `users` })
export class User {
  @Prop({ required: true })
  userTelegramId: number;

  @Prop()
  username: string;

  @Prop()
  orderType: string;
  
  @Prop()
  state: string;

  @Prop()
  pollId: number;

  @Prop()
  orderDays: string [];

  @Prop({default: false})
  orderDone: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);