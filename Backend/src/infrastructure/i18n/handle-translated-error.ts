import { Response, Request } from 'express';
import { DomainError } from '../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import { Catalog } from './catalog.types.js';
import { resolveLocale } from './resolve-locale.js';

export function handleTranslatedError(
  error: unknown,
  catalog: Catalog<EErrorCode>,
  res: Response,
  req?: Request,
): void {
  const locale = resolveLocale(req);

  if (error instanceof DomainError) {
    const message =
      catalog[error.code]?.[locale] ??
      catalog[EErrorCode.INTERNAL_ERROR][locale];
    res.status(error.status).json({ message });
    return;
  }

  const message = catalog[EErrorCode.INTERNAL_ERROR][locale];
  res.status(500).json({ message });
}
