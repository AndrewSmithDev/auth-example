import { Schema, model } from 'mongoose';

const RefreshTokenSchema = new Schema<RefreshToken>({
  expiry: {
    type: Date,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

type RefreshToken = {
  expiry: Date;
  refreshToken: string;
  user: string;
};

export const RefreshTokenModel = model('RefreshToken', RefreshTokenSchema);
