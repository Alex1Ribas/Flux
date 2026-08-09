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
  ): Promise<IConta[]>;
  listContasByRecorrente(
    userId: string,
    recorrenteId: string,
  ): Promise<IConta[]>;
}
