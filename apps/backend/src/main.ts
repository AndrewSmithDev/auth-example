import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';
import { UserModel } from './app/user.model';
import './app/passport-jwt';

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
    return res.status(401).send({ message: 'Invalid login' });
  }

  const validate = await user.isValidPassword(password);
  if (!validate) {
    return res.status(401).send({ message: 'Invalid login' });
  }

  const token = jwt.sign({ user: { id: user.id, email } }, 'TOP_SECRET');
  return res.json({ token });
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
