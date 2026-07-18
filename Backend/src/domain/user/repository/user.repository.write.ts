import type { IUser } from '../entity/interfaces/user.interface.js';
import { User } from '../entity/user.entity.js';

export interface IUserRepositoryWrite {
  createUser(user: User): Promise<IUser>;
  updateUserById(
    id: string,
    data: Partial<Pick<User, 'name' | 'email' | 'role'>>,
  ): Promise<IUser | null>;
  deleteUserById(id: string): Promise<boolean>;
}
