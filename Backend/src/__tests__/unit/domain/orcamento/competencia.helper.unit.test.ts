import {
  normalizeCompetencia,
  normalizeCompetenciaData,
} from '../../../../domain/orcamento/service/competencia.helper.js';
import { DomainError } from '../../../../domain/common/errors/DomainError.js';

describe('competencia.helper', () => {
  describe('when normalizeCompetencia receives month or full date', () => {
    it('should return only AAAA-MM', () => {
      expect(normalizeCompetencia('2026-08')).toEqual('2026-08');
      expect(normalizeCompetencia('2026-08-05')).toEqual('2026-08');
    });
  });

  describe('when normalizeCompetenciaData receives full date', () => {
    it('should preserve AAAA-MM-DD', () => {
      expect(normalizeCompetenciaData('2026-08-05')).toEqual('2026-08-05');
    });

    it('should preserve AAAA-MM when day is absent', () => {
      expect(normalizeCompetenciaData('2026-08')).toEqual('2026-08');
    });
  });

  describe('when competencia is invalid', () => {
    it('should throw DomainError for bad format', () => {
      expect(() => normalizeCompetenciaData('2026/08/05')).toThrow(DomainError);
      expect(() => normalizeCompetenciaData('2026-13-01')).toThrow(DomainError);
      expect(() => normalizeCompetenciaData('2026-08-32')).toThrow(DomainError);
    });
  });
});
