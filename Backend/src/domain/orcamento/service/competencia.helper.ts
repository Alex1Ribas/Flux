import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';

const COMPETENCIA_PATTERN = /^\d{4}-\d{2}(?:-\d{2})?$/;

function assertCompetenciaFormato(value: string): void {
  if (!value || !COMPETENCIA_PATTERN.test(value)) {
    throw new DomainError(EErrorCode.COMPETENCIA_INVALID, 400);
  }
  const month = value.slice(5, 7);
  if (Number(month) < 1 || Number(month) > 12) {
    throw new DomainError(EErrorCode.COMPETENCIA_INVALID, 400);
  }
  if (value.length === 10) {
    const day = Number(value.slice(8, 10));
    if (Number.isNaN(day) || day < 1 || day > 31) {
      throw new DomainError(EErrorCode.COMPETENCIA_INVALID, 400);
    }
  }
}

/** Normaliza para mês (AAAA-MM). Usado em orçamento e filtros mensais. */
export function normalizeCompetencia(competencia: string): string {
  const value = competencia?.trim();
  assertCompetenciaFormato(value);
  return value.slice(0, 7);
}

/**
 * Valida e preserva AAAA-MM ou AAAA-MM-DD.
 * Usado em lançamentos para rastreabilidade do dia.
 */
export function normalizeCompetenciaData(competencia: string): string {
  const value = competencia?.trim();
  assertCompetenciaFormato(value);
  return value;
}

export function competenciaNoMes(competencia: string, mes: string): boolean {
  return normalizeCompetencia(competencia) === normalizeCompetencia(mes);
}
