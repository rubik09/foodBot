import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  language: String,
  state: String
});

export interface User extends mongoose.Document {
  userId: number;
  username: string;
  language: string;
  state: string;
}
