import * as mongoose from 'mongoose';

export const ButtonSchema = new mongoose.Schema({
  path: String,
  button: String,
  text: String,
  language: String,
});

export interface Button extends mongoose.Document {
  path: string;
  button: string;
  text: string;
  language: string;
}
