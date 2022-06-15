import * as jwt from 'jsonwebtoken';
import { RefreshTokenModel } from './refresh-token.model';
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

export function createAccessToken(session: Session) {
  return jwt.sign(session, jwtConfig.secret, {
    expiresIn: jwtConfig.tokenLife,
  });
}

export function createRefreshToken(session: Session) {
  return jwt.sign(session, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshTokenLife,
  });
}

export async function createJwtTokens(session: Session) {
  const accessToken = createAccessToken(session);

  const refreshTokenCreationTime = new Date();
  const refreshToken = createRefreshToken(session);
  const expiry = new Date(
    new Date().setSeconds(
      refreshTokenCreationTime.getSeconds() + jwtConfig.refreshTokenLife
    )
  );

  const rtDoc = new RefreshTokenModel({
    refreshToken,
    expiry,
    user: session.user.id,
  });
  await rtDoc.save();

  return { accessToken, refreshToken };
}

export function extractSession(token: string): Session | undefined {
  const session = jwt.verify(token, jwtConfig.secret);
  if (isSession(session)) return session;
  return undefined;
}
