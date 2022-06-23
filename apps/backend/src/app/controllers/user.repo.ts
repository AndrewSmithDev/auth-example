import { createRepository } from '../repository';
import { User, UserModel } from '../user.model';

export const userRepo = createRepository<User, typeof UserModel>(UserModel);
