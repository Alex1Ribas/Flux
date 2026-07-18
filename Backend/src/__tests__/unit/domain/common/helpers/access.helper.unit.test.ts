import { EUserRole } from '../../../../../domain/user/entity/interfaces/user.interface.js';
import { assertResourceAccess } from '../../../../../domain/common/helpers/access.helper.js';
import { DomainError } from '../../../../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode.js';

describe('access.helper', () => {
  it('allows titular to access any owner', () => {
    expect(() =>
      assertResourceAccess({
        ownerId: 'other-id',
        requestUserId: 'self-id',
        requestRole: EUserRole.USER,
      }),
    ).not.toThrow();
  });

  it('allows dependente to access own record', () => {
    expect(() =>
      assertResourceAccess({
        ownerId: 'same-id',
        requestUserId: 'same-id',
        requestRole: EUserRole.DEPENDENT,
      }),
    ).not.toThrow();
  });

  it('denies dependente access to another owner', () => {
    try {
      assertResourceAccess({
        ownerId: 'other-id',
        requestUserId: 'self-id',
        requestRole: EUserRole.DEPENDENT,
      });
      fail('expected DomainError');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe(EErrorCode.ACCESS_DENIED);
    }
  });
});
