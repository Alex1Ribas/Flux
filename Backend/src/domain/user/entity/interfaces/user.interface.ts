/** USER = titular (account holder); DEPENDENT = dependente (family member). */
export enum EUserRole {
  USER = 'USER',
  DEPENDENT = 'DEPENDENT',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: EUserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsCreateUser {
  name: string;
  email: string;
  password: string;
  confPassword: string;
}
