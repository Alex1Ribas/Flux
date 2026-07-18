import type { IOrcamento } from '../../../domain/orcamento/entity/interfaces/orcamento.interface.js';
import type { IOrcamentoRepositoryRead } from '../../../domain/orcamento/repository/orcamento.repository.read.js';
import { MOrcamento } from '../../db/mongo/models/orcamento.model.js';
import { toIOrcamento } from './orcamento.mapper.js';

export class OrcamentoRepositoryRead implements IOrcamentoRepositoryRead {
  async findOrcamentoByUserCaixaCompetencia(
    userId: string,
    caixaId: string,
    competencia: string,
  ): Promise<IOrcamento | null> {
    const document = await MOrcamento.findOne({
      user: userId,
      caixa: caixaId,
      competencia,
    }).lean();
    return document ? toIOrcamento(document) : null;
  }

  async listOrcamentosByUserCompetencia(
    userId: string,
    competencia: string,
  ): Promise<IOrcamento[]> {
    const documents = await MOrcamento.find({ user: userId, competencia }).lean();
    return documents.map(toIOrcamento);
  }
}
