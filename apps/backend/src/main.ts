import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';
import { UserModel } from './app/user.model';
import './app/passport-jwt';
import { jwtConfig } from './app/jwt-config';
import { RefreshTokenModel } from './app/refresh-token.model';

mongoose.connect('mongodb://172.21.144.1:27017/auth-boilerplate');
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

  const accessToken = jwt.sign(
    jwtConfig.createTokenContents(user),
    jwtConfig.secret,
    { expiresIn: jwtConfig.tokenLife }
  );
  const refreshToken = jwt.sign(
    jwtConfig.createTokenContents(user),
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshTokenLife }
  );

  return res.json({ status: 'success', accessToken, refreshToken });
});

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  const savedToken = await RefreshTokenModel.findOne({ refreshToken });
  if (!savedToken) {
    return res.status(401).send({ status: 'error', message: 'Invalid token' });
  }

  const user = await UserModel.findById(savedToken.user);
  if (!user) {
    return res.status(401).send({ status: 'error', message: 'Invalid token' });
  }

  const accessToken = jwt.sign(
    jwtConfig.createTokenContents(user),
    jwtConfig.secret,
    { expiresIn: jwtConfig.tokenLife }
  );

  res.status(200).json({ status: 'success', accessToken });
});

app.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
