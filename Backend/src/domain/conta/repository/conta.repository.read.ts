import type {
  IConta,
  EStatusConta,
  ETipoConta,
} from '../entity/interfaces/conta.interface.js';

export interface IListContasRepositoryFiltro {
  status?: EStatusConta;
  tipo?: ETipoConta;
  competencia?: string;
}

export interface IContaRepositoryRead {
  findContaById(id: string): Promise<IConta | null>;
  listContasByUser(
    userId: string,
    filtro?: IListContasRepositoryFiltro,
  ): Promise<IConta[]>;
}
