import type { IOrcamento } from '../entity/interfaces/orcamento.interface.js';

export interface IOrcamentoRepositoryRead {
  findOrcamentoByUserCaixaCompetencia(
    userId: string,
    caixaId: string,
    competencia: string,
  ): Promise<IOrcamento | null>;
  listOrcamentosByUserCompetencia(
    userId: string,
    competencia: string,
  ): Promise<IOrcamento[]>;
}
