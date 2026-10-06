import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import {
  EUserRole,
  type IParamsCreateUser,
  type IUser,
} from '../entity/interfaces/user.interface.js';
import {
  ECredentialVerifyStatus,
  type ICreateUserResult,
  type IHashService,
  type ILoginUserResult,
  type IParamsLoginUser,
  type ITokenService,
  type IUserCredentialsPort,
  type IUserService,
} from '../entity/interfaces/user.service.interface.js';
import { User } from '../entity/user.entity.js';
import type { IUserRepositoryRead } from '../repository/user.repository.read.js';
import type { IUserRepositoryWrite } from '../repository/user.repository.write.js';

export const MIN_PASSWORD_LENGTH = 8;

export interface IParamsUserService {
  userRepositoryRead: IUserRepositoryRead;
  userRepositoryWrite: IUserRepositoryWrite;
  hashService: IHashService;
  tokenService: ITokenService;
  userCredentialsPort: IUserCredentialsPort;
}

export class UserService implements IUserService {
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly userRepositoryWrite: IUserRepositoryWrite;
  private readonly hashService: IHashService;
  private readonly tokenService: ITokenService;
  private readonly userCredentialsPort: IUserCredentialsPort;

  constructor({
    userRepositoryRead,
    userRepositoryWrite,
    hashService,
    tokenService,
    userCredentialsPort,
  }: IParamsUserService) {
    this.userRepositoryRead = userRepositoryRead;
    this.userRepositoryWrite = userRepositoryWrite;
    this.hashService = hashService;
    this.tokenService = tokenService;
    this.userCredentialsPort = userCredentialsPort;
  }

  async createUser(params: IParamsCreateUser): Promise<ICreateUserResult> {
    this.ensureValidCreatePayload(params);

    const email = params.email.trim().toLowerCase();
    const duplicate = await this.userRepositoryRead.findUserByEmail(email);
    if (duplicate) {
      throw new DomainError(EErrorCode.EMAIL_ALREADY_EXISTS, 409);
    }

    const passwordHash = await this.hashService.hash(params.password);
    const created = await this.userRepositoryWrite.createUser(
      new User('', params.name.trim(), email, passwordHash, EUserRole.USER),
    );

    return { message: 'User created successfully!', user: created };
  }

  async loginUser(params: IParamsLoginUser): Promise<ILoginUserResult> {
    if (!params.email?.trim()) {
      throw new DomainError(EErrorCode.EMAIL_REQUIRED, 400);
    }
    if (!params.password?.trim()) {
      throw new DomainError(EErrorCode.PASSWORD_REQUIRED, 400);
    }

    const verification = await this.userCredentialsPort.verify(
      params.email.trim().toLowerCase(),
      params.password,
    );

    if (verification.status !== ECredentialVerifyStatus.VALID || !verification.user) {
      throw new DomainError(EErrorCode.INVALID_CREDENTIALS, 401);
    }

    const user = verification.user;
    const token = this.tokenService.sign({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    return { message: 'Login successful!', token, id: user._id };
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepositoryRead.findUserById(id);
    if (!user) {
      throw new DomainError(EErrorCode.USER_NOT_FOUND, 404);
    }
    return user;
  }

  private ensureValidCreatePayload({
    name,
    email,
    password,
    confPassword,
  }: IParamsCreateUser): void {
    if (!name?.trim()) {
      throw new DomainError(EErrorCode.NAME_REQUIRED, 400);
    }
    if (!email?.trim()) {
      throw new DomainError(EErrorCode.EMAIL_REQUIRED, 400);
    }
    if (!email.includes('@')) {
      throw new DomainError(EErrorCode.INVALID_EMAIL, 400);
    }
    if (!password) {
      throw new DomainError(EErrorCode.PASSWORD_REQUIRED, 400);
    }
    if (!confPassword) {
      throw new DomainError(EErrorCode.CONF_PASSWORD_REQUIRED, 400);
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(EErrorCode.PASSWORD_TOO_SHORT, 400);
    }
    if (confPassword !== password) {
      throw new DomainError(EErrorCode.PASSWORD_MISMATCH, 400);
    }
  }
}
