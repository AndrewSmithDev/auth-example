import { Session } from '../session';

export const mapProfileResponse = <Context extends { session: Session }>(
  ctx: Context
) => ({
  ...ctx,
  body: { message: 'Profile', user: ctx.session },
});
