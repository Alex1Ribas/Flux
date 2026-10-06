import type { IUser } from '../entity/interfaces/user.interface.js';
import type { User } from '../entity/user.entity.js';

export interface IUserRepositoryWrite {
  createUser(user: User): Promise<IUser>;
}
