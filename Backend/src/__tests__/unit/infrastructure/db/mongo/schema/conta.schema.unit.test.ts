import {
  EStatusConta,
  ETipoConta,
} from '../../../../../../domain/conta/entity/interfaces/conta.interface.js';
import { MConta } from '../../../../../../infrastructure/db/mongo/models/conta.model.js';

describe('conta.schema', () => {
  describe('when document is valid', () => {
    it('should validate a pagar conta', async () => {
      const doc = new MConta({
        user: '507f1f77bcf86cd799439011',
        tipo: ETipoConta.A_PAGAR,
        descricao: 'Aluguel',
        valor: 1000,
        competencia: '2026-08',
        vencimento: '2026-08-10',
        caixaId: '507f1f77bcf86cd799439012',
        status: EStatusConta.ABERTA,
      });

      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('when tipo is invalid', () => {
    it('should reject validation', async () => {
      const doc = new MConta({
        user: '507f1f77bcf86cd799439011',
        tipo: 'invalid',
        descricao: 'Aluguel',
        valor: 1000,
        competencia: '2026-08',
        vencimento: '2026-08-10',
        caixaId: '507f1f77bcf86cd799439012',
      });

      await expect(doc.validate()).rejects.toThrow();
    });
  });
});
