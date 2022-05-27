import { Schema, model } from 'mongoose';
import { User, UserModel } from './user.model';

const RefreshTokenSchema = new Schema<RefreshToken>({
  expiry: {
    type: Date,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

type RefreshToken = {
  expiry: Date;
  user: string | User;
};

export const RefreshTokenModel = model('RefreshToken', RefreshTokenSchema);
