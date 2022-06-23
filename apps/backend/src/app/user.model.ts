import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt';

const UserSchema = new Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export type User = {
  email: string;
  password: string;
  isValidPassword: (password: string) => Promise<boolean>;
};

export const UserModel = model('user', UserSchema);
