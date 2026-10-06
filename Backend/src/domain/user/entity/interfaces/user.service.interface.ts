import type { EUserRole, IUser, IParamsCreateUser } from './user.interface.js';

export interface IParamsLoginUser {
  email?: string;
  password?: string;
}

export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface ITokenService {
  sign(payload: { _id: string; email: string; role: EUserRole }): string;
}

export enum ECredentialVerifyStatus {
  VALID = 'VALID',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
}

export interface ICredentialVerifyResult {
  status: ECredentialVerifyStatus;
  user?: IUser;
}

export interface IUserCredentialsPort {
  verify(email: string, plainPassword: string): Promise<ICredentialVerifyResult>;
}

export interface ICreateUserResult {
  message: string;
  user: IUser;
}

export interface ILoginUserResult {
  message: string;
  token: string;
  id: string;
}

export interface IUserService {
  createUser(params: IParamsCreateUser): Promise<ICreateUserResult>;
  loginUser(params: IParamsLoginUser): Promise<ILoginUserResult>;
  getUserById(id: string): Promise<IUser>;
}
