import type { IOrcamento } from '../entity/interfaces/orcamento.interface.js';
import type { Orcamento } from '../entity/orcamento.entity.js';

export interface IOrcamentoRepositoryWrite {
  upsertOrcamento(orcamento: Orcamento): Promise<IOrcamento>;
}
