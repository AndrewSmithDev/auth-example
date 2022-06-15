import * as jwt from 'jsonwebtoken';
import { isSession, Session } from './session';
import { User } from './user.model';

const second = 1;
const minutes = second * 60;
const hours = minutes * 60;

const jwtConfig = {
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

export function createAccessToken(payload: Session) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.tokenLife,
  });
}

export const { refreshTokenLife } = jwtConfig;
export function createRefreshToken(payload: Session) {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: refreshTokenLife,
  });
}

export function extractSession(token: string): Session | undefined {
  const session = jwt.verify(token, jwtConfig.secret);
  if (isSession(session)) return session;
  return undefined;
}
