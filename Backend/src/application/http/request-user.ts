import type { Request } from 'express';
import { DomainError } from '../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';

export function requestUserId(req: Request): string {
  const userId = req.user?._id;
  if (!userId) {
    throw new DomainError(EErrorCode.TOKEN_NOT_PROVIDED, 401);
  }
  return userId;
}
