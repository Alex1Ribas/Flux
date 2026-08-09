import type {
  IConta,
  EStatusConta,
  ETipoConta,
} from '../entity/interfaces/conta.interface.js';

export interface IListContasRepositoryFiltro {
  status?: EStatusConta;
  tipo?: ETipoConta;
  competencia?: string;
  recorrenteId?: string;
  /** Cursor: `_id` do último item da página anterior. */
  lastItemId?: string;
  pageSize?: number;
}

export interface IListaContasPaginada {
  items: IConta[];
  total: number;
  pageSize: number;
  /** `_id` do último item desta página (passar na próxima busca). */
  lastItemId: string | null;
  hasMore: boolean;
}

export interface IContaRepositoryRead {
  findContaById(id: string): Promise<IConta | null>;
  findContaByRecorrenteCompetencia(
    userId: string,
    recorrenteId: string,
    competencia: string,
  ): Promise<IConta | null>;
  listContasByUser(
    userId: string,
    filtro?: IListContasRepositoryFiltro,
  ): Promise<IListaContasPaginada>;
  listContasByRecorrente(
    userId: string,
    recorrenteId: string,
  ): Promise<IConta[]>;
}
