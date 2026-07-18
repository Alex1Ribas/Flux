import type { IOrcamento } from '../../../domain/orcamento/entity/interfaces/orcamento.interface.js';
import type { Orcamento } from '../../../domain/orcamento/entity/orcamento.entity.js';
import type { IOrcamentoRepositoryWrite } from '../../../domain/orcamento/repository/orcamento.repository.write.js';
import { MOrcamento } from '../../db/mongo/models/orcamento.model.js';
import { toIOrcamento, toPersistence } from './orcamento.mapper.js';

export class OrcamentoRepositoryWrite implements IOrcamentoRepositoryWrite {
  async upsertOrcamento(orcamento: Orcamento): Promise<IOrcamento> {
    const data = toPersistence(orcamento);
    const document = await MOrcamento.findOneAndUpdate(
      {
        user: data.user,
        caixa: data.caixa,
        competencia: data.competencia,
      },
      { $set: data },
      { new: true, runValidators: true, upsert: true },
    ).lean();
    return toIOrcamento(document);
  }
}
