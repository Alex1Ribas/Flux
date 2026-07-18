import type { EUserRole, IUser, IParamsCreateUser } from './user.interface.js';
import type { IUserRepositoryRead } from '../../repository/user.repository.read.js';
import type { IUserRepositoryWrite } from '../../repository/user.repository.write.js';

export interface IParamsLoginUser {
  email: string;
  password: string;
}

export type IParamsCreateDependente = IParamsCreateUser;

export interface IParamsUpdateUser {
  name?: string;
  email?: string;
  role?: EUserRole;
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

/** Port de infra: valida credenciais sem expor senha no contrato de repository */
export interface IUserCredentialsPort {
  verify(
    email: string,
    plainPassword: string,
  ): Promise<ICredentialVerifyResult>;
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

export interface IUpdateUserResult {
  message: string;
  user: IUser;
}

export interface IDeleteUserResult {
  message: string;
}

export interface IParamsUserService {
  userRepositoryRead: IUserRepositoryRead;
  userRepositoryWrite: IUserRepositoryWrite;
  hashService: IHashService;
  tokenService: ITokenService;
  userCredentialsPort: IUserCredentialsPort;
}

export interface IUserService {
  createUser(params: IParamsCreateUser): Promise<ICreateUserResult>;
  createDependente(params: IParamsCreateDependente): Promise<ICreateUserResult>;
  loginUser(params: IParamsLoginUser): Promise<ILoginUserResult>;
  listUsers(): Promise<IUser[]>;
  getUserById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IUser>;
  updateUserById(
    id: string,
    params: IParamsUpdateUser,
  ): Promise<IUpdateUserResult>;
  deleteUserById(id: string): Promise<IDeleteUserResult>;
}
