import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { DomainError } from '../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { paramId } from '../http/param-id.js';

export const validateObjectIdMiddleware: RequestHandler = (req, res, next) => {
  try {
    const id = paramId(req.params.id);
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new DomainError(EErrorCode.INVALID_OBJECT_ID, 400);
    }
    next();
  } catch (error) {
    handleTranslatedError(error, ErrorCatalog, res, req);
  }
};
