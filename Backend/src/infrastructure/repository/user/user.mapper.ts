import type { IUser } from '../../../domain/user/entity/interfaces/user.interface.js';
import { User } from '../../../domain/user/entity/user.entity.js';
import type { IMUser } from '../../db/mongo/models/user.model.js';

export function toIUser(document: IMUser): IUser {
  return {
    _id: document._id.toString(),
    name: document.name,
    email: document.email,
    role: document.role,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toUser(document: IMUser): User {
  return new User(
    document._id.toString(),
    document.name,
    document.email,
    document.password,
    document.role,
    document.createdAt,
    document.updatedAt,
  );
}

export function toPersistence(
  user: User,
): Pick<IMUser, 'name' | 'email' | 'password' | 'role'> {
  return {
    name: user.name,
    email: user.email,
    password: user.passwordHash,
    role: user.role,
  };
}
