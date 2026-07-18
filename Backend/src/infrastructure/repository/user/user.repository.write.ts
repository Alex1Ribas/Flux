import type { IUser } from '../../../domain/user/entity/interfaces/user.interface.js';
import { User } from '../../../domain/user/entity/user.entity.js';
import type { IUserRepositoryWrite } from '../../../domain/user/repository/user.repository.write.js';
import { MUser } from '../../db/mongo/models/user.model.js';
import { toIUser, toPersistence } from './user.mapper.js';

export class UserRepositoryWrite implements IUserRepositoryWrite {
  async createUser(user: User): Promise<IUser> {
    const document = await MUser.create(toPersistence(user));
    return toIUser(document);
  }

  async updateUserById(
    id: string,
    data: Partial<Pick<User, 'name' | 'email' | 'role'>>,
  ): Promise<IUser | null> {
    const document = await MUser.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();

    if (!document) {
      return null;
    }

    return toIUser(document);
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await MUser.findByIdAndDelete(id);
    return result !== null;
  }
}
