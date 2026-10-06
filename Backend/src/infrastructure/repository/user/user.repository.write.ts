import type { IUser } from '../../../domain/user/entity/interfaces/user.interface.js';
import type { User } from '../../../domain/user/entity/user.entity.js';
import type { IUserRepositoryWrite } from '../../../domain/user/repository/user.repository.write.js';
import { MUser } from '../../db/mongo/models/user.model.js';
import { toIUser, toPersistence } from './user.mapper.js';

export class UserRepositoryWrite implements IUserRepositoryWrite {
  async createUser(user: User): Promise<IUser> {
    const document = await MUser.create(toPersistence(user));
    return toIUser(document);
  }
}
