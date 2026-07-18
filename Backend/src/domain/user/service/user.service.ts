import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { EUserRole } from '../entity/interfaces/user.interface.js';
import type { IParamsCreateUser, IUser } from '../entity/interfaces/user.interface.js';
import {
  ECredentialVerifyStatus,
  type ICreateUserResult,
  type IDeleteUserResult,
  type ILoginUserResult,
  type IParamsCreateDependente,
  type IParamsLoginUser,
  type IParamsUpdateUser,
  type IParamsUserService,
  type IUpdateUserResult,
  type IUserService,
} from '../entity/interfaces/user.service.interface.js';
import { User } from '../entity/user.entity.js';

export class UserService implements IUserService {
  private readonly userRepositoryRead: IParamsUserService['userRepositoryRead'];
  private readonly userRepositoryWrite: IParamsUserService['userRepositoryWrite'];
  private readonly hashService: IParamsUserService['hashService'];
  private readonly tokenService: IParamsUserService['tokenService'];
  private readonly userCredentialsPort: IParamsUserService['userCredentialsPort'];

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

    const userCount = await this.userRepositoryRead.countUsers();
    if (userCount > 0) {
      throw new DomainError(EErrorCode.REGISTRATION_CLOSED, 403);
    }

    return this.persistUser(params, EUserRole.USER);
  }

  async createDependente(
    params: IParamsCreateDependente,
  ): Promise<ICreateUserResult> {
    this.ensureValidCreatePayload(params);
    return this.persistUser(params, EUserRole.DEPENDENT);
  }

  async loginUser(params: IParamsLoginUser): Promise<ILoginUserResult> {
    if (!params?.email?.trim()) {
      throw new DomainError(EErrorCode.EMAIL_REQUIRED, 400);
    }
    if (!params?.password?.trim()) {
      throw new DomainError(EErrorCode.PASSWORD_REQUIRED, 400);
    }

    const verification = await this.userCredentialsPort.verify(
      params.email.trim().toLowerCase(),
      params.password,
    );

    if (
      verification.status === ECredentialVerifyStatus.USER_NOT_FOUND ||
      verification.status === ECredentialVerifyStatus.INVALID_PASSWORD
    ) {
      throw new DomainError(EErrorCode.INVALID_CREDENTIALS, 401);
    }

    const user = verification.user!;

    const token = this.tokenService.sign({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful!',
      token,
      id: user._id,
    };
  }

  async listUsers(): Promise<IUser[]> {
    return this.userRepositoryRead.listUsers();
  }

  async getUserById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IUser> {
    const user = await this.userRepositoryRead.findUserById(id);
    if (!user) {
      throw new DomainError(EErrorCode.USER_NOT_FOUND, 404);
    }

    if (
      requestRole === EUserRole.DEPENDENT &&
      String(id) !== String(requestUserId)
    ) {
      throw new DomainError(EErrorCode.ACCESS_DENIED, 403);
    }

    return user;
  }

  async updateUserById(
    id: string,
    params: IParamsUpdateUser,
  ): Promise<IUpdateUserResult> {
    const payload: IParamsUpdateUser = { ...params };

    if (payload.email !== undefined) {
      if (!payload.email.includes('@')) {
        throw new DomainError(EErrorCode.INVALID_EMAIL, 400);
      }

      const existing = await this.userRepositoryRead.findUserByEmail(
        payload.email.trim().toLowerCase(),
      );
      if (existing && String(existing._id) !== String(id)) {
        throw new DomainError(EErrorCode.EMAIL_ALREADY_EXISTS, 409);
      }
      payload.email = payload.email.trim().toLowerCase();
    }

    if (payload.name !== undefined) {
      payload.name = payload.name.trim();
    }

    const cleaned: IParamsUpdateUser = {};
    if (payload.name !== undefined) cleaned.name = payload.name;
    if (payload.email !== undefined) cleaned.email = payload.email;
    if (payload.role !== undefined) cleaned.role = payload.role;

    if (Object.keys(cleaned).length === 0) {
      throw new DomainError(EErrorCode.NO_FIELDS_TO_UPDATE, 400);
    }

    const updated = await this.userRepositoryWrite.updateUserById(id, cleaned);
    if (!updated) {
      throw new DomainError(EErrorCode.USER_NOT_FOUND, 404);
    }

    return {
      message: 'Updated successfully!',
      user: updated,
    };
  }

  async deleteUserById(id: string): Promise<IDeleteUserResult> {
    const deleted = await this.userRepositoryWrite.deleteUserById(id);
    if (!deleted) {
      throw new DomainError(EErrorCode.USER_NOT_FOUND, 404);
    }

    return { message: 'User deleted successfully!' };
  }

  private async persistUser(
    params: IParamsCreateUser,
    role: EUserRole,
  ): Promise<ICreateUserResult> {
    const duplicate = await this.userRepositoryRead.findUserByEmail(
      params.email.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new DomainError(EErrorCode.EMAIL_ALREADY_EXISTS, 409);
    }

    if (params.password.length < 8) {
      throw new DomainError(EErrorCode.PASSWORD_TOO_SHORT, 400);
    }

    if (params.confPassword !== params.password) {
      throw new DomainError(EErrorCode.PASSWORD_MISMATCH, 400);
    }

    const passwordHash = await this.hashService.hash(params.password);

    const user = new User(
      '',
      params.name.trim(),
      params.email.trim().toLowerCase(),
      passwordHash,
      role,
    );

    const created = await this.userRepositoryWrite.createUser(user);

    return {
      message: 'User created successfully!',
      user: created,
    };
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
  }
}
