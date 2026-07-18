import {
  EHorizonteLancamento,
  ETipoLancamento,
} from '../../../../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import { MLancamento } from '../../../../../../infrastructure/db/mongo/models/lancamento.model.js';

describe('lancamento.schema', () => {
  it('validates a valid lancamento document', async () => {
    const doc = new MLancamento({
      user: '507f1f77bcf86cd799439011',
      tipo: ETipoLancamento.ENTRADA,
      horizonte: EHorizonteLancamento.PRESENTE,
      valor: 100,
      descricao: 'Salario mensal',
      competencia: '2026-01',
      distribuicao: [{ caixa: '507f1f77bcf86cd799439012', valor: 100 }],
    });

    await expect(doc.validate()).resolves.toBeUndefined();
  });

  it('rejects invalid tipo enum', async () => {
    const doc = new MLancamento({
      user: '507f1f77bcf86cd799439011',
      tipo: 'invalid',
      horizonte: EHorizonteLancamento.PRESENTE,
      valor: 100,
      descricao: 'Salario mensal',
      competencia: '2026-01',
    });

    await expect(doc.validate()).rejects.toThrow();
  });
});
