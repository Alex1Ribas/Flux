import { EUserRole } from './interfaces/user.interface.js';

export class User {
  constructor(
    public readonly _id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: EUserRole,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
