import { Either, Just, Nothing } from 'purify-ts';
import { UnauthorizedError } from './http-errors';
import { extractSession } from './jwt';
import { RouteContext } from './router-handler';
import { Session } from './session';

function extractToken(bearer?: string) {
  if (!bearer || bearer.substring(0, 7) !== 'Bearer ') return Nothing;
  const token = bearer.substring(7);
  if (token.length < 0) return Nothing;
  return Just(token);
}

export const getSessionMW = <T extends RouteContext>(
  context: T
): Either<UnauthorizedError, T & { session: Session }> => {
  const { req } = context;
  return extractToken(req.headers.authorization)
    .chain(extractSession)
    .map((session) => ({ ...context, session }))
    .toEither(new UnauthorizedError());
};
