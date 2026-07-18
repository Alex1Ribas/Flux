import { MCaixa } from '../../../../../../infrastructure/db/mongo/models/caixa.model.js';

describe('caixa.schema', () => {
  it('validates a valid caixa document', async () => {
    const doc = new MCaixa({
      user: '507f1f77bcf86cd799439011',
      nome: 'Essencial',
      saldo: 100,
    });

    await expect(doc.validate()).resolves.toBeUndefined();
  });

  it('rejects missing name', async () => {
    const doc = new MCaixa({
      user: '507f1f77bcf86cd799439011',
      saldo: 100,
    });

    await expect(doc.validate()).rejects.toThrow();
  });
});
