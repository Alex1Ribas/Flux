import type { IOrcamento } from './orcamento.interface.js';
import type { IOrcamentoRepositoryRead } from '../../repository/orcamento.repository.read.js';
import type { IOrcamentoRepositoryWrite } from '../../repository/orcamento.repository.write.js';

export interface IParamsUpsertOrcamentoInput {
  caixa: string;
  valor: number;
}

export interface IParamsOrcamentoService {
  orcamentoRepositoryRead: IOrcamentoRepositoryRead;
  orcamentoRepositoryWrite: IOrcamentoRepositoryWrite;
}

export interface IOrcamentoService {
  listOrcamentos(
    requestUserId: string,
    competencia: string,
  ): Promise<IOrcamento[]>;
  upsertOrcamentos(
    requestUserId: string,
    competencia: string,
    orcamentos: IParamsUpsertOrcamentoInput[],
  ): Promise<IOrcamento[]>;
}
