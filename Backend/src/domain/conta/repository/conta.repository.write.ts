import type { Conta } from '../entity/conta.entity.js';
import type { IConta } from '../entity/interfaces/conta.interface.js';
import type { IParamsUpdateConta } from '../entity/interfaces/conta.service.interface.js';

export interface IContaRepositoryWrite {
  createConta(conta: Conta): Promise<IConta>;
  updateContaById(id: string, params: IParamsUpdateConta & {
    liquidadoEm?: string;
    lancamentoId?: string;
    recorrenteId?: string;
  }): Promise<IConta | null>;
  deleteContaById(id: string): Promise<IConta | null>;
}
