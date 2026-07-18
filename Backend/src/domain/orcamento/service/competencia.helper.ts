import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';

const COMPETENCIA_PATTERN = /^\d{4}-\d{2}(?:-\d{2})?$/;

export function normalizeCompetencia(competencia: string): string {
  const value = competencia?.trim();
  if (!value || !COMPETENCIA_PATTERN.test(value)) {
    throw new DomainError(EErrorCode.COMPETENCIA_INVALID, 400);
  }
  const month = value.slice(5, 7);
  if (Number(month) < 1 || Number(month) > 12) {
    throw new DomainError(EErrorCode.COMPETENCIA_INVALID, 400);
  }
  return value.slice(0, 7);
}

export function competenciaNoMes(competencia: string, mes: string): boolean {
  return normalizeCompetencia(competencia) === normalizeCompetencia(mes);
}
