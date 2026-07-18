import { MOrcamento } from '../../../../../../infrastructure/db/mongo/models/orcamento.model.js';

describe('orcamento.schema', () => {
  it('validates a valid orcamento document', async () => {
    const doc = new MOrcamento({
      user: '507f1f77bcf86cd799439011',
      caixa: '507f1f77bcf86cd799439012',
      competencia: '2026-01',
      valor: 500,
    });

    await expect(doc.validate()).resolves.toBeUndefined();
  });

  it('rejects negative value', async () => {
    const doc = new MOrcamento({
      user: '507f1f77bcf86cd799439011',
      caixa: '507f1f77bcf86cd799439012',
      competencia: '2026-01',
      valor: -1,
    });

    await expect(doc.validate()).rejects.toThrow();
  });
});
