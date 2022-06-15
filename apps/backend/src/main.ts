import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import { UserModel } from './app/user.model';
import './app/passport-jwt';
import {
  createAccessToken,
  createRefreshToken,
  refreshTokenLife,
} from './app/jwt';
import { RefreshTokenModel } from './app/refresh-token.model';
import { getSessionMW } from './app/jwt-auth';
import { createSession } from './app/session';

mongoose.connect(`mongodb://${process.env.mongoUri}/auth-boilerplate`);
mongoose.connection.on('error', (error) => console.log(error));

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to the backend!' });
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const user = new UserModel({ email, password });
  await user.save();
  res.send(user);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).send({ status: 'error', message: 'Invalid login' });
  }

  const validate = await user.isValidPassword(password);
  if (!validate) {
    return res.status(401).send({ status: 'error', message: 'Invalid login' });
  }

  const sessionData = createSession(user);
  const accessToken = createAccessToken(sessionData);

  const refreshTokenCreationTime = new Date();
  const refreshToken = createRefreshToken(sessionData);
  const expiry = new Date(
    new Date().setSeconds(
      refreshTokenCreationTime.getSeconds() + refreshTokenLife
    )
  );

  const rtDoc = new RefreshTokenModel({ refreshToken, expiry, user: user.id });
  await rtDoc.save();

  return res.json({ status: 'success', accessToken, refreshToken });
});

app.post(
  '/refresh-token',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { refreshToken } = req.body;

    const savedToken = await RefreshTokenModel.findOne({
      refreshToken,
    });
    if (!savedToken) {
      return res
        .status(401)
        .send({ status: 'error', message: 'Invalid token' });
    }

    const user = await UserModel.findById(savedToken.user);
    if (!user) {
      return res
        .status(401)
        .send({ status: 'error', message: 'Invalid token' });
    }

    const sessionData = createSession(user);
    const accessToken = createAccessToken(sessionData);

    res.status(200).json({ status: 'success', accessToken, refreshToken });
  }
);

app.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { session } = getSessionMW(req, res, {});
    console.log(session);
    res.json({
      message: 'You made it to the secure route',
      user: req.user,
    });
  }
);

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}\n`);
});

server.on('error', console.error);
