import { EUserRole } from '../../user/entity/interfaces/user.interface.js';

export interface IJwtPayload {
  _id: string;
  email: string;
  role: EUserRole;
}
