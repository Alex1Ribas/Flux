import type { IUser } from '../entity/interfaces/user.interface.js';

export interface IUserRepositoryRead {
  findUserById(id: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  listUsers(): Promise<IUser[]>;
  countUsers(): Promise<number>;
}
