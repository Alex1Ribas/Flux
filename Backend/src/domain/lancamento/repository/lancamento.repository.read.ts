import type {
  ILancamento,
  IListLancamentosFiltro,
} from '../entity/interfaces/lancamento.interface.js';

export interface IBuscaCategoriasFiltro {
  tipo: 'entrada' | 'saida';
  q?: string;
  limit?: number;
}

export interface ILancamentoRepositoryRead {
  findLancamentoById(id: string): Promise<ILancamento | null>;
  listLancamentosByUser(
    userId: string,
    filtro?: IListLancamentosFiltro,
  ): Promise<ILancamento[]>;
  listLancamentosByUserCompetencia(
    userId: string,
    competencia: string,
  ): Promise<ILancamento[]>;
  existsLancamentoByCaixa(caixaId: string): Promise<boolean>;
  searchCategoriasDistintas(
    userId: string,
    filtro: IBuscaCategoriasFiltro,
  ): Promise<string[]>;
}
