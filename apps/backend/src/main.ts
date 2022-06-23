import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import { UserModel } from './app/user.model';
import { createAccessToken, createJwtTokens } from './app/jwt';
import { RefreshTokenModel } from './app/refresh-token.model';
import { getSessionMW } from './app/jwt-auth';
import { createSession } from './app/session';
import { router } from './app/router';
import { mapProfileResponse } from './app/controllers/user.controller';
import { userRepo } from './app/controllers/user.repo';

mongoose.connect(`mongodb://${process.env.MONGO_URI}/auth-boilerplate`);
mongoose.connection.on('error', (error) => console.log(error));

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome dto the backend!' });
});

// app.post('/register', async (req, res) => {
//   const { email, password } = req.body;
//   const user = new UserModel({ email, password });
//   await user.save();
//   res.send(user);
// });

router.post('/register', (route) =>
  route.map((ctx) => ({ ...ctx, dto: req.body as any })).chain(userRepo.create)
);

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
  const { accessToken, refreshToken } = await createJwtTokens(sessionData);

  return res.json({ status: 'success', accessToken, refreshToken });
});

app.post('/refresh-token', async (req, res) => {
  getSessionMW({ req, res })
    .map(async () => {
      const { refreshToken } = req.body;

      const savedToken = await RefreshTokenModel.findOne({
        refreshToken,
      });
      if (!savedToken) {
        return res.status(401).send({ status: 401, message: 'Invalid token' });
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
    })
    .mapLeft(() =>
      res.status(401).send({ status: 401, message: 'Unauthorized' })
    );
});

router.get('/profile', (route) =>
  route.chain(getSessionMW).map(mapProfileResponse)
);

router.init(app);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}\n`);
});

server.on('error', console.error);
