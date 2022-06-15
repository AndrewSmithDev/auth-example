import { Request, Response } from 'express';
import { extractSession } from './jwt';
import { Session } from './session';

export const getSessionMW = <T extends Record<string, unknown>>(
  req: Request,
  res: Response,
  context: T
): T & { session: Session | undefined } => {
  const { authorization } = req.headers;
  if (!authorization || authorization.substring(0, 7) !== 'Bearer ') {
    return { ...context, session: undefined };
  }

  const token = authorization.substring(7);
  const session = extractSession(token);

  return { ...context, session };
};
