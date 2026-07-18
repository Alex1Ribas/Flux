import { DomainError } from '../errors/DomainError.js';
import { EErrorCode } from '../errors/enums/EErrorCode.js';
import { EUserRole } from '../../user/entity/interfaces/user.interface.js';

export interface IAssertResourceAccessParams {
  ownerId: string;
  requestUserId: string;
  requestRole: EUserRole;
}

/** Titular (USER) may access any resource; dependente only own records. */
export function assertResourceAccess({
  ownerId,
  requestUserId,
  requestRole,
}: IAssertResourceAccessParams): void {
  if (requestRole === EUserRole.USER) {
    return;
  }
  if (String(ownerId) !== String(requestUserId)) {
    throw new DomainError(EErrorCode.ACCESS_DENIED, 403);
  }
}
