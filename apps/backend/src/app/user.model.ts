import { Schema, model, Document } from 'mongoose';
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
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

export type User = Document & {
  email: string;
  password: string;
  isValidPassword: (password: string) => Promise<boolean>;
};

export const UserModel = model('user', UserSchema);
