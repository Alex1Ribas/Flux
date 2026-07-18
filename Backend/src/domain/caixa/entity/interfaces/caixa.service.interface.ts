import type { EUserRole } from '../../../user/entity/interfaces/user.interface.js';
import type { ETipoCaixa, ICaixa, IParamsCreateCaixa } from './caixa.interface.js';
import type { ICaixaRepositoryRead } from '../../repository/caixa.repository.read.js';
import type { ICaixaRepositoryWrite } from '../../repository/caixa.repository.write.js';

export interface IParamsCreateCaixaInput extends Omit<IParamsCreateCaixa, 'user'> {
  userId?: string;
}

export interface IParamsUpdateCaixa {
  nome?: string;
  saldo?: number;
  tipo?: ETipoCaixa;
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
}

export interface IParamsCaixaService {
  caixaRepositoryRead: ICaixaRepositoryRead;
  caixaRepositoryWrite: ICaixaRepositoryWrite;
}

export interface ICaixaService {
  createCaixa(requestUserId: string, params: IParamsCreateCaixaInput): Promise<ICaixa>;
  listCaixas(requestUserId: string): Promise<ICaixa[]>;
  getCaixaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ICaixa>;
  updateCaixaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsUpdateCaixa,
  ): Promise<ICaixa>;
  deleteCaixaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ICaixa>;
}
