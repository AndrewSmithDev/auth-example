import * as passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserModel } from './user.model';

const users = [{ id: 1, email: 'example@example.com', password: 'password' }];

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'TOP_SECRET',
  // issuer: 'accounts.examplesoft.com',
  // audience: 'yoursite.net',
};

passport.use(
  new Strategy(opts, async function (jwt_payload, done) {
    const user = await UserModel.findById(jwt_payload.user.id);
    if (user) return done(null, user);
    return done(new Error(`No user found for ${jwt_payload.sub}`), false);
  })
);
