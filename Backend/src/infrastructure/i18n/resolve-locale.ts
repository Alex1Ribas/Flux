import { Request } from 'express';
import { SupportedLocale } from './catalog.types.js';

const SUPPORTED: SupportedLocale[] = ['pt-BR', 'en', 'es'];

export function resolveLocale(req?: Request): SupportedLocale {
  const header = req?.headers['accept-language'];
  if (!header || typeof header !== 'string') {
    return 'pt-BR';
  }
  const preferred = header.split(',')[0]?.trim().split(';')[0]?.trim();
  if (preferred && SUPPORTED.includes(preferred as SupportedLocale)) {
    return preferred as SupportedLocale;
  }
  if (preferred?.startsWith('pt')) return 'pt-BR';
  if (preferred?.startsWith('es')) return 'es';
  if (preferred?.startsWith('en')) return 'en';
  return 'pt-BR';
}
