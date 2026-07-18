import {
  ECredentialVerifyStatus,
  type ICredentialVerifyResult,
  type IUserCredentialsPort,
} from '../../domain/user/entity/interfaces/user.service.interface.js';
import { MUser } from '../db/mongo/models/user.model.js';
import { toIUser } from '../repository/user/user.mapper.js';
import { HashService } from './hash.service.js';

export class UserCredentialsService implements IUserCredentialsPort {
  private readonly hashService = new HashService();

  async verify(
    email: string,
    plainPassword: string,
  ): Promise<ICredentialVerifyResult> {
    const document = await MUser.findOne({ email }).select('+password').lean();

    if (!document) {
      return { status: ECredentialVerifyStatus.USER_NOT_FOUND };
    }

    const valid = await this.hashService.compare(plainPassword, document.password);

    if (!valid) {
      return { status: ECredentialVerifyStatus.INVALID_PASSWORD };
    }

    return {
      status: ECredentialVerifyStatus.VALID,
      user: toIUser(document),
    };
  }
}
