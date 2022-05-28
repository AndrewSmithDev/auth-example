import { User } from './user.model';

const second = 1;
const minutes = second * 60;
const hours = minutes * 60;

export const jwtConfig = {
  secret: 'TOP_SECRET',
  refreshSecret: 'REFRESH_SECRET',
  tokenLife: 15 * minutes,
  refreshTokenLife: 24 * hours,
  createTokenContents: (user: User) => {
    return {
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },
};
