import type { IUser } from '../../../domain/user/entity/interfaces/user.interface.js';
import type { IUserRepositoryRead } from '../../../domain/user/repository/user.repository.read.js';
import { MUser } from '../../db/mongo/models/user.model.js';
import { toIUser } from './user.mapper.js';

export class UserRepositoryRead implements IUserRepositoryRead {
  async findUserById(id: string): Promise<IUser | null> {
    const document = await MUser.findById(id).lean();
    if (!document) {
      return null;
    }
    return toIUser(document);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const document = await MUser.findOne({ email }).lean();
    if (!document) {
      return null;
    }
    return toIUser(document);
  }

  async listUsers(): Promise<IUser[]> {
    const documents = await MUser.find().lean();
    return documents.map(toIUser);
  }

  async countUsers(): Promise<number> {
    return MUser.countDocuments();
  }
}
