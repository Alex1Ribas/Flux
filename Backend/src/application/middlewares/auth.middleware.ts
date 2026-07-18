import type { RequestHandler } from 'express';
import { DomainError } from '../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { EUserRole } from '../../domain/user/entity/interfaces/user.interface.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';

export function createAuthMiddleware(
  tokenService: TokenService,
  userRepositoryRead: IUserRepositoryRead,
): RequestHandler {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new DomainError(EErrorCode.TOKEN_NOT_PROVIDED, 401);
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

      const payload = tokenService.verify(token);
      const user = await userRepositoryRead.findUserById(payload._id);

      if (!user) {
        throw new DomainError(EErrorCode.INVALID_TOKEN, 401);
      }

      if (user.role !== payload.role) {
        throw new DomainError(EErrorCode.INVALID_TOKEN, 401);
      }

      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };
      next();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}

export function requireRole(...allowedRoles: EUserRole[]): RequestHandler {
  return (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) {
        throw new DomainError(EErrorCode.ACCESS_DENIED, 403);
      }
      if (!allowedRoles.includes(role)) {
        throw new DomainError(EErrorCode.ACCESS_DENIED, 403);
      }
      next();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
