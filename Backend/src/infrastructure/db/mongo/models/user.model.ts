import { model, Types } from 'mongoose';
import type { IUser } from '../../../../domain/user/entity/interfaces/user.interface.js';
import { userSchema } from '../schema/user.schema.js';

export interface IMUser extends Omit<IUser, '_id'> {
  _id: Types.ObjectId;
  password: string;
}

export const MUser = model<IMUser>('User', userSchema);
