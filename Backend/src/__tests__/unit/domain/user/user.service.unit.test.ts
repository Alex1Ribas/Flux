import { jest } from '@jest/globals';
import { DomainError } from '../../../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode.js';
import { EUserRole } from '../../../../domain/user/entity/interfaces/user.interface.js';
import { ECredentialVerifyStatus } from '../../../../domain/user/entity/interfaces/user.service.interface.js';
import { UserService } from '../../../../domain/user/service/user.service.js';

function buildService(userCount: number, verifyStatus = ECredentialVerifyStatus.VALID) {
  const user = { _id: 'u1', name: 'Titular', email: 'a@b.c', role: EUserRole.USER };
  return new UserService({
    userRepositoryRead: {
      findUserById: jest.fn(async () => user),
      findUserByEmail: jest.fn(async () => null),
      listUsers: jest.fn(async () => [user]),
      countUsers: jest.fn(async () => userCount),
    },
    userRepositoryWrite: { createUser: jest.fn(async () => user) },
    hashService: { hash: jest.fn(async () => 'hash'), compare: jest.fn(async () => true) },
    tokenService: { sign: jest.fn(() => 'jwt') },
    userCredentialsPort: { verify: jest.fn(async () => ({ status: verifyStatus, user })) },
  });
}

const payload = { name: 'Titular', email: 'A@B.C', password: '12345678', confPassword: '12345678' };

describe('UserService', () => {
  it('should register the first account holder', async () => {
    const result = await buildService(0).createUser(payload);
    expect(result.user._id).toEqual('u1');
  });

  it('should allow new accounts after the first one', async () => {
    const result = await buildService(3).createUser(payload);
    expect(result.user._id).toEqual('u1');
  });

  it('should reject short passwords', async () => {
    await expect(
      buildService(0).createUser({ ...payload, password: '123', confPassword: '123' }),
    ).rejects.toEqual(new DomainError(EErrorCode.PASSWORD_TOO_SHORT, 400));
  });

  it('should return a token on valid login', async () => {
    const result = await buildService(1).loginUser({ email: 'a@b.c', password: '12345678' });
    expect(result.token).toEqual('jwt');
  });

  it('should answer 401 for any invalid credential', async () => {
    await expect(
      buildService(1, ECredentialVerifyStatus.USER_NOT_FOUND).loginUser({ email: 'x@y.z', password: 'x' }),
    ).rejects.toEqual(new DomainError(EErrorCode.INVALID_CREDENTIALS, 401));
  });
});
